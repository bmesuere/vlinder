#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Settings file related to the calculation of landcover fractions
"""
import os

# =============================================================================
# IO settings
# =============================================================================

# The path to the BBK (Bodem bedekkings kaart) folder, LOCAL FOLDER!!
BBK_folder="/home/thoverga/Documents/github/maps/Landuse/BBK2015"
s2glc_file='/home/thoverga/Documents/github/maps/Landuse/S2GLC_EUROPE_2017/S2GLC_Europe_2017_v1.2.tif'


# =============================================================================
# Landcover settings
# =============================================================================
landcovers = ['groen', 'verhard', 'water'] #volgorde van belang voor de stack


#landcover_colors = ['green', 'red', 'blue'] #volgorde corresponderend met landcovers
#landcover_colors = ["#6ebd02","#8c8c8c", "#00afff"] #groen - grijs - blauw
landcover_colors = ["#6ebd02","#d12f06", "#00afff"] #groen - rood - blauw


buffers = ['20', '50', '100', '250', '500']



# =============================================================================
# Landcover maps
# =============================================================================

s2glc_settings = {
    'file': s2glc_file,
    'data_band': 1,
    'classes': {
        0: {'color': (255,255,255,255), 'name': 'clouds'},
        62: {'color': (210,0,0,255), 'name': 'Artificial surfaces and constructions'},
        73: {'color': (253,211,39,255), 'name': 'Cultivated areas'},
        75: {'color': (176,91,16,255), 'name': 'Vineyards'},
        82: {'color': (35,152,0,255), 'name': 'Broadleaf tree cover'},
        83: {'color': (8,98,0,255), 'name': 'Coniferious tree cover'},
        102: {'color': (249,150,39,255), 'name': 'Herbaceous vegetation'},
        103: {'color': (141,139,0,255), 'name': 'Moors and heathland'},
        104: {'color': (95,53,6,255), 'name': 'Sclerophyllous vegetation'},
        105: {'color': (149,107,196,255), 'name': 'Marshes'},
        106: {'color': (77,37,106,255), 'name': 'Peatbogs'},
        121: {'color': (154,154,154,255), 'name': 'Natural material surfaces'},
        123: {'color': (106,255,255,255), 'name': 'Permanent snow covered surfaces'},
        162: {'color': (20,69,249,255), 'name': 'Water bodies'},
        255: {'color': (255,255,255,255), 'name': 'No data'}
        },
    'agg':{
        'groen': ['clouds',
                 'Cultivated areas',
                 'Vineyards',
                 'Broadleaf tree cover',
                 'Coniferious tree cover',
                 'Herbaceous vegetation',
                 'Moors and heathland',
                 'Sclerophyllous vegetation',
                 'Marshes',
                 'Peatbogs',
                 'Natural material surfaces',
                 'Permanent snow covered surfaces',
                 'No data'],
        'verhard' : ['Artificial surfaces and constructions'],
        'water': ['Water bodies']
        },
    }


BBK_settings = {
    'folder': '/home/thoverga/Documents/github/maps/Landuse/BBK2015',
    'mapper': {
        1: 'building',
        2: 'road',
        3: 'rest_impervious',
        4: 'rail_road',
        5: 'water',
        6: 'rest_non_impervious',
        7: 'crop_land',
        8: 'gras_shrub',
        9: 'tree',
        10: 'gras_shrub_agriculture',
        11: 'gras_shrub_road',
        12: 'trees_road',
        13: 'gras_shrub_water',
        14: 'trees_water'
        },
    'agg':{
        'groen': ['tree', 'rest_non_impervious', 'gras_shrub', 'crop_land', 'gras_shrub_agriculture', 'gras_shrub_road',
                                     'gras_shrub_water', 'trees_water', 'trees_road'],
        'verhard' : ['road', 'rest_impervious', 'rail_road', 'building'],
        'water': ['water']
        },
    'crs': "EPSG:31370"

    }

#BBK is stored as chunked maps
BBK_settings['files'] = [os.path.join(BBK_settings['folder'], x) for x in os.listdir(BBK_settings['folder']) if x.endswith(".tif")]
