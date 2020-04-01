import pymysql
import pymysql.cursors
import json

def get_connection():
    info = json.load(open("login.json"))
    return pymysql.connect(cursorclass=pymysql.cursors.DictCursor, **info)

def query(sql):
    connection = get_connection()
    with connection.cursor() as cursor:
        cursor.execute(sql)
        data = cursor.fetchall()
    connection.close()
    return data

def get_stations_raw(id=None)
    #if id = None return all stations
    #else only return selected station
    #row (csv data + status) zie app.py station
    raise NotImplementedError()

def get_measurements_raw(id=None, after=None, before=None)
    #if id is none get latest data of each station
    #else select data between after < x < before
    #Row = {$foreach sample: data$, time:<>, status:<Ok,Offline,N/A>, id:<>}
    if (after or before) and not id: throw ValueError("if using after/before an id must be specified")

    raise NotImplementedError()


### OLD ###

# def get_connection():
#     return pymysql.connect(host='********',
#                            user='********',
#                            password='*************',
#                            db='**************',
#                            cursorclass=pymysql.cursors.DictCursor)

#
# @app.route('/db_stations', methods=['GET'])
# @cross_origin()
# def db_stations():
#     return jsonify(get_stations())
#
#
# @app.route('/stations', methods=['GET'])
# @cross_origin()
# def stations():
#     data = {}
#     with open('data.csv', 'r') as f:
#         csv_reader = csv.DictReader(f)
#         for row in csv_reader:
#             id = row.get('ID')
#             for key in ["lat","lon","water20","verhard20","groen20","water50","verhard50","groen50","water100","verhard100","groen100","water250","verhard250","groen250","water500","verhard500","groen500"]:
#                 row[key] = float(row[key])
#             data[id] = row
#     return jsonify(data)
#
#
# @app.route('/vlinder/<id>', methods=['GET'])
# @cross_origin()
# def vlinder(id: str = None):
#     start_p = request.args.get('start')
#     end_p = request.args.get('end')
#     if start_p is None and end_p:
#         abort(400)
#
#     start_d = datetime.now() - timedelta(hours=24) if not start_p else datetime.strptime(start_p, '%Y-%m-%dT%H:%M:%S.%fZ')
#     end_d = datetime.now() if not end_p else datetime.strptime(end_p, '%Y-%m-%dT%H:%M:%S.%fZ')
#     if start_d >= end_d:
#         abort(400)
#
#     start = start_d.strftime('%Y-%m-%d %H:%M')
#     end = end_d.strftime('%Y-%m-%d %H:%M')
#
#     return jsonify(add_status(get_vlinder(id, start, end), start_d))
#
#
# @app.route('/vlinder', methods=['GET'])
# @cross_origin()
# def latest_vlinder_data():
#     return jsonify(get_latest_all_vlinder())
#
#
# def vlinder_data_transform(row):
#     return {
#         'id': row['StationID'],
#         'temp': float(row['temperature']),
#         'humidity': float(row['humidity']),
#         'pressure': row['pressure'] / 100,
#         'windSpeed': float(row['WindSpeed']),
#         'windDirection': float(row['WindDirection']),
#         'rainIntensity': float(row['RainIntensity']),
#         'rainVolume': float(row['RainVolume']),
#         'windGust': float(row['WindGust']),
#         'time': row['datetime']
#     }
#
#
# def get_vlinder(id, start, end):
#     connection = get_connection()
#     if id is None:
#         with connection.cursor() as cursor:
#             sql = "SELECT ID FROM Vlinder_Identification"
#             cursor.execute(sql)
#             id = cursor.fetchone()['ID']
#     with connection.cursor() as cursor:
#         sql = f"SELECT * FROM Vlinder WHERE StationID = '{id}' AND datetime BETWEEN '{start}' AND '{end}' ORDER BY datetime ASC"
#         cursor.execute(sql)
#         data = cursor.fetchall()
#     connection.close()
#     return list(map(vlinder_data_transform, data))
#
#
# def get_latest_all_vlinder():
#     connection = get_connection()
#     with connection.cursor() as cursor:
#         sql = f"SELECT * FROM Vlinder ORDER BY datetime DESC LIMIT 59"
#         cursor.execute(sql)
#         data = cursor.fetchall()
#     connection.close()
#     return list(map(vlinder_data_transform, data))
#
#
# def get_stations():
#     connection = get_connection()
#     with connection.cursor() as cursor:
#         sql = "SELECT * FROM Vlinder_Identification LIMIT 0, 100"
#         cursor.execute(sql)
#         data = cursor.fetchall()
#     connection.close()
#     return data
#
#
# def add_status(vlinder_data, start_time):
#     prev = None
#     prev_time = start_time
#     for d in vlinder_data:
#         if prev_time < d['time'] - timedelta(minutes=9):
#             d['status'] = 'server_failure'
#         elif prev is not None and prev['temp'] == d['temp'] and prev['humidity'] == d['humidity'] and prev['pressure'] == d['pressure'] and \
#                 prev['windSpeed'] == d['windSpeed'] and prev['windDirection'] == d['windDirection']:
#             d['status'] = 'vlinder_failure'
#         else:
#             d['status'] = 'ok'
#         prev_time = d['time']
#         prev = d
#     return vlinder_data
