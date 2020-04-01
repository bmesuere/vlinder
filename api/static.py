import csv

station_metadata = csv.DictReader(open("data.csv"))

d = {"lon":"longitude", "lat":"latitude"}
def rename(s):
    return d[s] if s in d else s
