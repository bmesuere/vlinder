from flask import Flask, jsonify
import pymysql.cursors

app = Flask(__name__)

# Connect to the database
connection = pymysql.connect(host='framboos.ugent.be',
                             user='s225015',
                             password='fmztqgxfakuy3n',
                             db='vlinder',
                             cursorclass=pymysql.cursors.DictCursor)


@app.route('/')
def home():
    return 'Stations: <a>/stations</a><br/>Real-time data: <a>/vlinder</a>'


@app.route('/stations', methods=['GET'])
def stations():
    return jsonify(get_stations())


@app.route('/vlinder', methods=['GET'])
def vlinder_default():
    return jsonify(get_vlinder(None))


@app.route('/vlinder/<id>', methods=['GET'])
def vlinder(id: str = None):
    return jsonify(get_vlinder(id))


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


def get_vlinder(id):
    if id is None:
        with connection.cursor() as cursor:
            sql = "SELECT ID FROM Vlinder_Identification"
            cursor.execute(sql)
            id = cursor.fetchone()['ID']
    with connection.cursor() as cursor:
        sql = f"SELECT * FROM Vlinder WHERE StationID='{id}' ORDER BY 'datetime' ASC"
        cursor.execute(sql)
        data = cursor.fetchone()
        return vlinder_data_transform(data)


def get_stations():
    with connection.cursor() as cursor:
        sql = "SELECT * FROM Vlinder_Identification LIMIT 0, 100"
        cursor.execute(sql)
        return cursor.fetchall()


if __name__ == '__main__':
    app.run()
