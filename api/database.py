import json
from datetime import timedelta, datetime

import pymysql
import pymysql.cursors

from static import station_metadata


latest_vlinder_data = []
last_request_time = None


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
        if last_request_time and now - last_request_time > timedelta(minutes=5):
            latest_vlinder_data = list(map(vlinder_data_transform, query(f"SELECT * FROM Vlinder ORDER BY datetime DESC LIMIT 59")))
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
    return add_status(data, start_d)


def add_status(vlinder_data, start_time):
    prev = None
    prev_time = start_time
    for d in vlinder_data:
        d['status'] = 'Ok'
        if prev_time < d['time'] - timedelta(minutes=9) or (
                prev is not None and prev['temp'] == d['temp'] and prev['humidity'] == d['humidity'] and
                prev['pressure'] == d['pressure'] and prev['windSpeed'] == d['windSpeed'] and
                prev['windDirection'] == d['windDirection']):
            d['status'] = 'server_failure'
        else:
            d['status'] = 'Offline'
        prev_time = d['time']
        prev = d
    return vlinder_data


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
