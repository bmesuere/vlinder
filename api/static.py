import csv
import os

from api.kaartjes.image_tools import vlinder_png_to_base64

station_metadata = []
with open('data.csv', 'r') as f:
    csv_reader = csv.DictReader(f)
    for row in csv_reader:
        for key in ["lat", "lon", "water20", "verhard20", "groen20", "water50", "verhard50", "groen50", "water100",
                    "verhard100", "groen100", "water250", "verhard250", "groen250", "water500", "verhard500",
                    "groen500"]:
            row[key] = float(row[key])
        station_metadata.append(row)
    for row in station_metadata:
        vlinder = row['VLINDER']
        if os.path.isfile(f'kaartjes/{vlinder}_crop.png'):
            row['image'] = vlinder_png_to_base64(f'kaartjes/{vlinder}_crop.png')
        else:
            row['image'] = 'none'

d = {"lon": "longitude", "lat": "latitude"}


def rename(s):
    return d[s] if s in d else s
