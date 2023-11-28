#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Settings file related to the calculation of landcover fractions
"""

# =============================================================================
# IO settings
# =============================================================================
output_folder = ""
north_arrow = ""

# =============================================================================
# Boolean settings
# =============================================================================

add_other_locations_in_plot = True #others will be plotted in blue

# plot_all_stations = False

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
xrange=8000 #physical range of the map in meters
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