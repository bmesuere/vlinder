#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Settings file related to the calculation of landcover fractions
"""
from pathlib import Path
import os

scripts_path = Path(__file__).resolve().parents[1]

# =============================================================================
# IO settings
# =============================================================================
output_folder = os.path.join(scripts_path, 'output')
north_arrow = os.path.join(scripts_path, 'resources', 'north.png')

# =============================================================================
# Boolean settings
# =============================================================================
add_other_locations_in_plot = True #others will be plotted in blue

figure_with_title = False
add_hist_to_figure = False
add_scale_bar = True
add_north_arrow = True
add_buffer_circles = False
run_mogrify = True #only on unix


# =============================================================================
# Map settings
# =============================================================================

# figure settings
width=int(590 * 1.2) #do not change
height=int(255 * 1.2) #do not change
dpi = 200

target_width = 590 #will be used by mogrify
target_height = 255 #will be used by mogrify

# Physical size of the figure !! Normal 7000 / 3500 but for hitt bestendige steden a higher resolution is required to desinguish stations.
xrange=8000 #physical range of the map in meter
yrange = xrange/(width/height)
east_displacement = 0. #in meters to move to the left out of center
south_displacement = 0. #in meters to move to the north out of center

# =============================================================================
# Background tile
# =============================================================================

# Note: Stamen is not free anymore, so a free (non-commersial) tile provider is
# used instead with API key (no billing has been set up, so it is save to hardcode)

API_key_stadia_maps='930161cf-6d72-4000-9746-3b611a97d493'
tilesource='https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png?api_key='+f'{API_key_stadia_maps}'

zoomlevel=14 #the detail level of the tile