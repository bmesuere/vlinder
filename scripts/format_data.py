#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Methods to format the tabular data to chosen standards.

@author: thoverga
"""


import pandas as pd
import csv


def write_vlinder_data_to_csv(data, data_path):
    
    #check for duplicates
    uniqueColumns=['ID', 'VLINDER']
    for uniquecol in uniqueColumns:
        assert data[uniquecol].duplicated().any(), f'Duplicate values found in data column: {uniquecol}'

    data.to_csv(path_or_buf = data_path,
                sep=',',
                float_format = '%.6f',
                index=False,
                quoting=csv.QUOTE_ALL)

    print('Data writen to ', data_path, ' in a dashboard-compatible way!')

