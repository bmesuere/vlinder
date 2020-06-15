import csv
from os import path
from datetime import datetime

station_metadata = []
with open('data.csv', 'r', encoding="utf-8") as f:
    csv_reader = csv.DictReader(f)
    for row in csv_reader:
        for key in ["lat", "lon", "water20", "verhard20", "groen20", "water50", "verhard50", "groen50", "water100",
                    "verhard100", "groen100", "water250", "verhard250", "groen250", "water500", "verhard500",
                    "groen500"]:
            row[key] = float(row[key])
        station_metadata.append(row)
    for row in station_metadata:
        vlinder = row['VLINDER']

stations_last_modified = datetime.fromtimestamp(path.getmtime("data.csv")).replace(microsecond=0)

d = {"lon": "longitude", "lat": "latitude"}


def rename(s):
    return d[s] if s in d else s
