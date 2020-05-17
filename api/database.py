import json
from datetime import timedelta, datetime
from collections import deque

import pymysql
import pymysql.cursors
from static import station_metadata

latest_vlinder_data = []
last_request_time = None
status_lookback = 3


def get_connection():
    with open('login.json') as f:
        info = json.load(f)
    return pymysql.connect(cursorclass=pymysql.cursors.DictCursor, **info)


def query(sql):
    connection = get_connection()
    with connection.cursor() as cursor:
        cursor.execute(sql)
        data = cursor.fetchall()
    connection.close()
    return data


def get_stations_raw(id=None):
    # if id = None return all stations
    # else only return selected station
    # row (csv data + status) zie app.py station
    if id is None:
        return station_metadata
    return [station for station in station_metadata if station['ID'] in id]


def get_measurements_raw(id=None, start=None, end=None):
    # if id is none get latest data of each station
    # else select data between after < x < before
    # Row = {$foreach sample: data$, time:<>, status:<Ok,Offline,N/A>, id:<>}
    if (start or end) and not id:
        raise ValueError("if using after/before an id must be specified")

    if id is None:
        global last_request_time, latest_vlinder_data
        now = datetime.now()
        if not last_request_time or now - last_request_time > timedelta(minutes=5):
            group_length = status_lookback + 1
            # Get len(vlinders) * status_lookback latest vlinder data
            latest_vlinder_data = list(
                map(vlinder_data_transform, query('SELECT * FROM Vlinder ORDER BY datetime DESC LIMIT ' +
                                                  str(group_length * len(station_metadata)))))
            # Reverse order => ascending in time
            latest_vlinder_data = latest_vlinder_data[::-1]
            # Group data points per vlinder
            latest_vlinder_data_grouped = [
                [latest_vlinder_data[i + x * len(station_metadata)] for x in range(group_length)] for i in
                range(len(station_metadata))
            ]
            # Get time of first data point
            start_d = latest_vlinder_data_grouped[0][0]['time']
            # Add status to the data points and use only last data point per vlinder
            latest_vlinder_data = [d[-1] for d in map(lambda d: add_status(d, start_d), latest_vlinder_data_grouped)]
            last_request_time = now
        return latest_vlinder_data
    if start is None and end:
        raise ValueError()

    start_d = datetime.now() - timedelta(hours=24) if not start else datetime.strptime(start,
                                                                                       '%Y-%m-%dT%H:%M:%S.%fZ')
    end_d = datetime.now() if not end else datetime.strptime(end, '%Y-%m-%dT%H:%M:%S.%fZ')
    if start_d >= end_d:
        raise ValueError()

    start_s = start_d.strftime('%Y-%m-%d %H:%M')
    end_s = end_d.strftime('%Y-%m-%d %H:%M')
    data = list(map(vlinder_data_transform, query(
        f"SELECT * FROM Vlinder WHERE StationID = '{id}' AND datetime BETWEEN '{start_s}' AND '{end_s}' ORDER BY datetime ASC")))
    return fix_cumulative_rain(add_status(data, start_d))


def add_status(vlinder_data, start_time):
    prev = deque([])
    prev_time = start_time
    for d in vlinder_data:
        d['status'] = 'Ok'
        if data_equal(prev, d, status_lookback):
            d['status'] = 'Server Failure'
            for d1 in prev:
                d1['status'] = 'Server Failure'
        elif prev_time < d['time'] - timedelta(minutes=9):
            d['status'] = 'Offline'
        prev_time = d['time']
        prev.append(d)
        if len(prev) > status_lookback:
            prev.popleft()
    return vlinder_data


def fix_cumulative_rain(d_list):
    prev = d_list[0]['rainVolume']
    delta = -prev
    for d in d_list:
        if d['rainVolume'] < prev:
            delta += prev - d['rainVolume']
        prev = d['rainVolume']
        d['rainVolume'] += delta
    return d_list


def data_equal(d_list, d, threshold):
    for d1 in d_list:
        if not (d1 is not None and d1['temp'] == d['temp'] and d1['humidity'] == d['humidity'] and
                d1['pressure'] == d['pressure'] and d1['windSpeed'] == d['windSpeed'] and
                d1['windDirection'] == d['windDirection'] and d1['rainIntensity'] == d['rainIntensity'] and
                d1['rainVolume'] == d['rainVolume'] and d1['windGust'] == d['windGust']):
            return False
    return len(d_list) >= threshold


def vlinder_data_transform(row):
    return {
        'id': row['StationID'],
        'temp': float(row['temperature']),
        'humidity': float(row['humidity']),
        'pressure': row['pressure'] / 100,
        'windSpeed': float(row['WindSpeed']),
        'windDirection': float(row['WindDirection']),
        'rainIntensity': float(row['RainIntensity']),
        'rainVolume': float(row['RainVolume']),
        'windGust': float(row['WindGust']),
        'time': row['datetime']
    }


if __name__ == '__main__':
    get_stations_raw()
