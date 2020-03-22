from datetime import datetime, timedelta

from flask import Flask, jsonify, request, abort
from flask_cors import CORS, cross_origin
import pymysql.cursors
import csv

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


def get_connection():
    return pymysql.connect(host='framboos.ugent.be',
                           user='s225015',
                           password='fmztqgxfakuy3n',
                           db='vlinder',
                           cursorclass=pymysql.cursors.DictCursor)


@app.route('/db_stations', methods=['GET'])
@cross_origin()
def db_stations():
    return jsonify(get_stations())


@app.route('/stations', methods=['GET'])
@cross_origin()
def stations():
    data = {}
    with open('data.csv', 'r') as f:
        csv_reader = csv.DictReader(f)
        for row in csv_reader:
            id = row.get('ID')
            for key in ["lat","lon","water20","verhard20","groen20","water50","verhard50","groen50","water100","verhard100","groen100","water250","verhard250","groen250","water500","verhard500","groen500"]:
                row[key] = float(row[key])
            data[id] = row
    return jsonify(data)


@app.route('/vlinder/<id>', methods=['GET'])
@cross_origin()
def vlinder(id: str = None):
    start_p = request.args.get('start')
    end_p = request.args.get('end')
    if start_p is None and end_p:
        abort(400)

    start_d = datetime.now() - timedelta(hours=24) if not start_p else datetime.strptime(start_p, '%Y-%m-%dT%H:%M:%S.%fZ')
    end_d = datetime.now() if not end_p else datetime.strptime(end_p, '%Y-%m-%dT%H:%M:%S.%fZ')
    if start_d >= end_d:
        abort(400)

    start = start_d.strftime('%Y-%m-%d %H:%M')
    end = end_d.strftime('%Y-%m-%d %H:%M')

    return jsonify(add_status(get_vlinder(id, start, end), start_d))


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


def get_vlinder(id, start, end):
    connection = get_connection()
    if id is None:
        with connection.cursor() as cursor:
            sql = "SELECT ID FROM Vlinder_Identification"
            cursor.execute(sql)
            id = cursor.fetchone()['ID']
    with connection.cursor() as cursor:
        sql = f"SELECT * FROM Vlinder WHERE StationID = '{id}' AND datetime BETWEEN '{start}' AND '{end}' ORDER BY datetime ASC"
        cursor.execute(sql)
        data = cursor.fetchall()
    connection.close()
    return list(map(vlinder_data_transform, data))


def get_stations():
    connection = get_connection()
    with connection.cursor() as cursor:
        sql = "SELECT * FROM Vlinder_Identification LIMIT 0, 100"
        cursor.execute(sql)
        data = cursor.fetchall()
    connection.close()
    return data


def add_status(vlinder_data, start_time):
    prev = None
    prev_time = start_time
    for d in vlinder_data:
        if prev_time < d['time'] - timedelta(minutes=9):
            d['status'] = 'server_failure'
        elif prev is not None and prev['temp'] == d['temp'] and prev['humidity'] == d['humidity'] and prev['pressure'] == d['pressure'] and \
                prev['windSpeed'] == d['windSpeed'] and prev['windDirection'] == d['windDirection']:
            d['status'] = 'vlinder_failure'
        else:
            d['status'] = 'ok'
        prev_time = d['time']
        prev = d
    return vlinder_data


if __name__ == '__main__':
    app.run()
