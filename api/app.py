from database import get_stations_raw, get_measurements_raw
from flask import Flask, jsonify, request, abort
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

base_url = open('../vlinder/.env').readline().split('=')[1].rstrip('\n')


@app.route('/api/')
def root():
    return jsonify({
        "stations": base_url + "stations",
        "measurements": base_url + "measurements",
    })


@app.route('/api/stations')
@cross_origin()
def stations():
    return jsonify([station(**s) for s in get_stations_raw()])


@app.route('/api/stations/<id>')
@cross_origin()
def stations_id(id):
    if id is None or id == '':
        abort(400)
    return station(**get_stations_raw({id}))


@app.route('/api/measurements')
@cross_origin()
def measurements():
    return jsonify(list(map(measurement, get_measurements_raw())))


@app.route('/api/measurements/<id>')
@cross_origin()
def measurements_id(id):
    start_p = request.args.get('start')
    end_p = request.args.get('end')
    # arg checking
    return jsonify(list(map(measurement, get_measurements_raw(id, start_p, end_p))))


def station(ID, VLINDER, lat, lon,
            water20, verhard20, groen20,
            water50, verhard50, groen50,
            water100, verhard100, groen100,
            water250, verhard250, groen250,
            water500, verhard500, groen500,
            stad, benaming):
    return {
        "id": ID,
        "name": VLINDER,
        "city": stad,
        "given_name": benaming,
        "coordinates": {
            "longitude": lon,
            "latitude": lat,
        },
        "landUse": [
            {"distance": 20, "usage": [{"type": "water", "value": water20},
                                       {"type": "green", "value": groen20},
                                       {"type": "paved", "value": verhard20}]
             },
            {"distance": 50, "usage": [{"type": "water", "value": water50},
                                       {"type": "green", "value": groen50},
                                       {"type": "paved", "value": verhard50}]
             },
            {"distance": 100, "usage": [{"type": "water", "value": water100},
                                        {"type": "green", "value": groen100},
                                        {"type": "paved", "value": verhard100}]
             },
            {"distance": 250, "usage": [{"type": "water", "value": water250},
                                        {"type": "green", "value": groen250},
                                        {"type": "paved", "value": verhard250}]
             },
            {"distance": 500, "usage": [{"type": "water", "value": water500},
                                        {"type": "green", "value": groen500},
                                        {"type": "paved", "value": verhard500}]
             },
        ],
        "measurements": f"{base_url}measurements/{ID}"
    }


def measurement(m):
    # m[time] = format it
    m['measurements'] = f"{base_url}measurements/{m['id']}"
    m['station'] = f"{base_url}stations/{m['id']}"
    return m


if __name__ == '__main__':
    app.run()
