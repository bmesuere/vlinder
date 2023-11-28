#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to generate the spatial VLINDER maps per station as is used in the dashboard.

Created on Tue Sep 14 15:42:26 2021

@author: thoverga
"""

#%% Imports


import pandas as pd
# from bokeh.tile_providers import get_provider, Vendors
# from bokeh.plotting import figure, show
from pyproj import Proj, transform
# from bokeh.models.markers import Circle
# from bokeh.models import ColumnDataSource, Scatter
# from bokeh.models.glyphs import Text
# from bokeh.io import export_png
# from bokeh.models import Legend
# from bokeh.models import Arrow, OpenHead, NormalHead, VeeHead, Label
from matplotlib_scalebar.scalebar import ScaleBar
from matplotlib.patches import Circle

import contextily as cx
import matplotlib.pyplot as plt
import os, sys
from pathlib import Path

import geopandas as gpd
import shapely

import csv
import selenium
# import geckodriver




#%%import path file
main_repo_folder = (Path(__file__).resolve().parent.parent)
sys.path.append(str(main_repo_folder))
import path_handler
print('Path handling module loaded')
import format_data_file


#%% Change variables by terminal input
def change_var_if_needed(var_value, var_name):
    yes_or_no = input('{} is set to: {}, is this oke? (y/n)  '.format(var_name, var_value))
    if yes_or_no != 'y':
        if isinstance(var_value, bool):
            return_val = not var_value
            print(var_name, '  -->  ', return_val)
            return return_val
        else:
            return_val = input('new value for {} : '.format(var_name))
            return return_val
    else:
        return var_value


#%%  general settings

# make width larger than target, this will be fixed using mogrify

width=int(590 * 1.2) #do not change
height=int(255 * 1.2) #do not change
dpi = 200

target_width = 590#will be used by mogrify
target_height = 255 #will be used by mogrify

add_other_locations_in_plot = True #others will be plotted in blue
plot_all_stations = False


data_path = path_handler.meta_data_stations
savedirectory = path_handler.folders['dashboard_visuals']['map_plot']


landcovers = ['groen', 'verhard', 'water'] #volgorde van belang voor de stack


#landcover_colors = ['green', 'red', 'blue'] #volgorde corresponderend met landcovers
#landcover_colors = ["#6ebd02","#8c8c8c", "#00afff"] #groen - grijs - blauw
landcover_colors = ["#6ebd02","#d12f06", "#00afff"] #groen - rood - blauw


buffers = ['20', '50', '100', '250', '500']


# Physical size of the figure !! Normal 7000 / 3500 but for hitt bestendige steden a higher resolution is required to desinguish stations.
xrange=8000
east_displacement = 0. #in meters to move to the left out of center
south_displacement = 0. #in meters to move to the north out of center


# Map provider
# Get provider
API_key_stadia_maps='930161cf-6d72-4000-9746-3b611a97d493'
tile : 'stamen_terrain'
source='https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png?api_key='+f'{API_key_stadia_maps}'

mapinfo = cx.providers.Stamen.Terrain #Lower resolution max zoomlevel 14
mapinfo = cx.providers.Stadia.AlidadeSmooth
# mapinfo = cx.providers.Esri.WorldTopoMap #higher resolution max zoomlevel >15
zoomlevel = 14

#%%
yrange = xrange/(width/height)
import matplotlib.ticker as ticker
from mpl_toolkits.axes_grid1.inset_locator import inset_axes

def make_stacked_hist(station, data, landcovers = landcovers, landcover_colors = landcover_colors, buffers = buffers, save_directory = savedirectory):
    subdf = data[data['VLINDER'] == station] #subsetting data

    #refactor data in dictionary

    histdict = {x:[] for x in landcovers}
    # histdict['buffers'] = buffers

    for buf in buffers:
        for landcovertype in landcovers:
            columnname = landcovertype + buf
            histdict[landcovertype].append(subdf[columnname].iloc[0])

    # To pandas dataframe
    plotdf = pd.DataFrame(index=buffers,
                          data=histdict)
    # make colordict
    colordict = {x[0]: x[1] for x in list(zip(landcovers, landcover_colors))}

    #create figure if needed

    fig, ax = plt.subplots()

    # add plot
    ax = plotdf.plot.bar(stacked=True, color=colordict, ax=ax, rot=0)


    x_labels = ax.get_xticks()
    # print(x_labels)
    ax.set_xticklabels([f'{x} m' for x in plotdf.index])
    # ax.set_xticks
    # ax.xaxis.set_major_formatter(ticker.FormatStrFormatter('%f m'))


    # p = figure(x_range=histdict['buffers'], plot_height=250,
    #        toolbar_location=None, tools="")

    # ax.vbar_stack(landcovers, x='buffers', width=0.9, color=landcover_colors, fill_alpha = 0.7, source=histdict,
    #              legend_label=landcovers)

    ax.xaxis.axis_label = 'Buffer straal (m)'
    ax.yaxis.axis_label = 'Fractie'


    # ax.axis.axis_label_text_font_style = 'bold'
    # ax.xgrid.grid_line_color = None
    # ax.ygrid.grid_line_color = None

    # ax.xaxis.major_label_text_font_style = 'bold'
    # ax.yaxis.major_label_text_font_style = 'bold'

    # ax.y_range.start = 0
    # ax.x_range.range_padding = 0.1
    # ax.xgrid.grid_line_color = None
    # ax.axis.minor_tick_line_color = None
    # ax.outline_line_color = None
    # ax.legend.location = "bottom_center"
    # ax.legend.orientation = "horizontal"


    # ax.xgrid.grid_line_color = None
    # ax.axis.minor_tick_line_color = None
    # ax.outline_line_color = None
    # ax.legend.location = "bottom_center"
    # ax.legend.orientation = "horizontal"


    # ax.xaxis.axis_line_width = 3
    # ax.yaxis.axis_line_width = 3
    # ax.xaxis.axis_label_text_font_size = '17pt'
    # ax.yaxis.axis_label_text_font_size = '15pt'
    # ax.xaxis.axis_label_text_font_style = 'bold'
    # ax.yaxis.axis_label_text_font_style = 'bold'

    # ax.yaxis.major_label_text_font_style = "bold"
    # ax.yaxis.major_label_text_font_size = '15pt'
    # ax.xaxis.major_label_text_font_style = "bold"
    # ax.xaxis.major_label_text_font_size = '15pt'

    # ax.legend.label_text_font_size = "15pt"
    # ax.legend.border_line_width = 3
    # ax.legend.border_line_color = "navy"
    # ax.legend.border_line_alpha = 0.5


    ax.background_fill_color = None
    ax.border_fill_color = None

    # return ax
    #save figure
    figure_location = os.path.join(save_directory,"stacked_" + station + ".png")

    plt.savefig(fname= figure_location)
    print("Stacked histograme saved here: " + figure_location)
    return figure_location






def makefigure(station, data,
               add_title, add_scale, add_arrow, add_circles,
               with_stacked_barchart = False, landcovers = landcovers,
               landcover_colors = landcover_colors, buffers = buffers, save_directory = savedirectory,
               add_other_locations_in_plot = False):


    # subdata = data[data["VLINDER"] == station]

    geodf = gpd.GeoDataFrame(
                        data,
                        geometry=gpd.points_from_xy(data['lon'], data['lat']),
                        crs="EPSG:4326"
        )

    def projectie_2(gdf):
        #project to metric crs
        gdf = gdf.to_crs(epsg=3857) #lambert72 projectie
        gdf['x']  = gdf['geometry'].x
        gdf['y']  = gdf['geometry'].y
        return gdf



    geodf = projectie_2(geodf)

    # extract refstation:
    refstation = geodf[geodf["VLINDER"] == station]
    # Note, the x and y def are reversed !!!!
    x, y = refstation['x'].iloc[0], refstation['y'].iloc[0]

    school = list(refstation['school'])[0]
    naam = list(refstation['VLINDER'])[0]
    stad = list(refstation['stad'])[0]
    titel = naam +' (' + stad + ') - ' + school

    print(titel)



    # create rectangular buffer arround refstation
    xmin = x - (xrange/2.) - east_displacement
    xmax = x + (xrange/2.) - east_displacement
    ymin = y - (yrange/2.) + south_displacement
    ymax = y + (yrange/2.) + south_displacement
    #def rectangurar geometry
    box = shapely.geometry.box(xmin, ymin, xmax, ymax, ccw=True)


    # Make figure
    scaler = 35.
    fig, ax = plt.subplots(figsize=((590./scaler), (255./scaler)))

    if add_other_locations_in_plot:
        #def rectangurar geometry
        box = shapely.geometry.box(xmin, ymin, xmax, ymax, ccw=True)
        # get all others
        possible_others = geodf[geodf["VLINDER"] != station]
        others = possible_others[possible_others.within(box)]

        # plot blue scatters
        ax = others.plot(kind='geo',ax = ax, color='blue', alpha=0.5, markersize=(590./scaler)*10)



    # Plot refstation as red scater
    ax = refstation.plot(kind='geo',ax = ax, color='red', alpha=0.8, markersize=(590./scaler)*15)




    # styleing attributes
    ax.set_xlim(xmin, xmax)
    ax.set_ylim(ymin, ymax)
    # add basemap
    # print(f'mapinfo: {mapinfo} |n zoomlevl: {zoomlevel}, crs: {refstation.crs.to_string()}')
    # cx.add_basemap(ax, source=mapinfo, zoom=zoomlevel,
                           # crs=refstation.crs.to_string())
    cx.add_basemap(ax, source=source, zoom=zoomlevel, crs=refstation.crs.to_string())

    ax.axis('off')


    if add_scale:
        ax.add_artist(ScaleBar(1, location='upper right', box_alpha=0))

    if add_title:
        ax.set_title(titel)

    if add_arrow:

        im = plt.imread(path_handler.folders['dashboard_visuals']['north-arrow']) # insert local path of the image.
        newax = fig.add_axes([0.83,0.01,0.15,0.15], anchor='SE', zorder=1)
        newax.imshow(im)
        newax.axis('off')

    if add_circles:
        for bufrad in buffers:
            circ = Circle(xy=(refstation['geometry'].x.iloc[0],
                          refstation['geometry'].y.iloc[0]),
                      radius = float(bufrad),
                      facecolor=(0, 1, 0, 0.0), #color does not matter, last num is alpha
                      edgecolor='red')
            ax.add_artist(circ)

    if with_stacked_barchart:

        bar_plot_location = make_stacked_hist(station=station,
                          data=data,
                          landcovers = landcovers,
                          landcover_colors = landcover_colors,
                          buffers = buffers,
                          save_directory = savedirectory)
        # barim = plt.imread(bar_plot_location) # insert local path of the image.
        # newax = fig.add_axes([0.1,0.8,0.2,0.2], anchor='NW', zorder=1)
        # newax.imshow(barim)
        # newax.axis('off')




    plt.tight_layout()
    # plt.show()
    figpath =os.path.join(save_directory, naam+".png")

    plt.savefig(figpath,
                dpi=scaler,
                bbox_inches='tight',
                pad_inches = 0.0,)
    print('figure for ', naam, ' is saved here: ', figpath)
    print('Mogrifying the figure to target resolution and removing of any borders:')
    mogrif_command = f'mogrify -trim -fuzz 10% -resize {target_width}x{target_height}! {figpath}'
    print(f' \n {mogrif_command} \n')
    os.system(mogrif_command)



    return



# Gis and update functions

def calculate_landuse(lat, lon, bufferlist, BBK_settings):

    """ This functions calculate the landuse as fractions for the stations based on a buffer radius.
        As a first attempt, the landuse will be derived from the first key in the rasterdict (BBK). If the station (or the buffer),
        is outside the domain of the these maps, the next map is used.

         Keyword arguments: \n
            stationdf -- pd.DataFrame
                        a pandas dataframe with at least the following columns: station (the name of the station),
                        lat (latitute of station), lon (lontitude of the station)
            bufferlist -- list
                        a LIST with the buffer radii in meter \n

        Return
            stationdf with added columns for the landuseclasses as fractions, a column indication for: the used map, the buffer radius. """



    total_geodf = pd.DataFrame() #initiate return df

    raster_iterator = iter(BBK_settings['files']) #create a iterable of the rastersets
    raster = next(raster_iterator) #try with the first raster in the raster dict

    returndict = {}

    for buffer_radius in bufferlist:

        # append_row = row.copy()
        # append_row['buffer_radius'] = buffer_radius

        #create circular buffer in the coordinates of the raster file
        buffer_geometry = gis.coordinate_to_circular_buffer_geometry(lat_center=lat,
                                                                     lon_center=lon,
                                                                     radius_m=buffer_radius,
                                                                     crs = BBK_settings['crs'])
        #get cell value frequency table of the geometry on the raster
        freq_table = gis.ULTIMATE_read_from_rasterfile(geometry = buffer_geometry,
                                                       raster_file_list =BBK_settings['files'],
                                                       return_map_info = False,
                                                       return_counts=True,
                                                       none_if_no_overlap=True)
        if freq_table.empty:

            import rasterio
            print('no counts collected, try other map')
            backup_map_settings = path_handler.s2glc_settings

            map_used='S2GLC'
            #get crs from map meta info
            with rasterio.open(backup_map_settings['file']) as gismap:
                backup_crs = gismap.crs

            #make geometry in backup crs
            buffer_geometry = gis.coordinate_to_circular_buffer_geometry(lat_center=lat,
                                                                         lon_center=lon,
                                                                         radius_m=buffer_radius,
                                                                         crs = backup_crs)

            #get cell value frequency table of the geometry on the raster
            freq_table = gis.ULTIMATE_read_from_rasterfile(geometry = buffer_geometry,
                                                           raster_file_list = backup_map_settings['file'],
                                                           return_map_info = False,
                                                           return_counts=True,
                                                           none_if_no_overlap=True)

            category_mapper = {key: item['name'] for key, item in backup_map_settings['classes'].items()}


            #normalize
            total_counts = freq_table['counts'].sum()
            freq_table['fractions'] = [x/total_counts for x in freq_table['counts']]
            freq_table['lc'] = freq_table['category'].map(category_mapper)
            #add unused classes for consistency
            freq_table = freq_table.merge(pd.Series(category_mapper.values(), name='lc'),how='outer', on='lc')


            freq_table['fractions'] = freq_table['fractions'].fillna(0.0)
            freq_table = pd.Series(data=list(freq_table['fractions']), index=freq_table['lc'], name='fraction')

            freq_table_agg = {}
            #aggregate classes
            for agg_class in backup_map_settings['agg']:
                key_name = agg_class + str(buffer_radius)
                freq_table_agg[key_name] = freq_table.loc[backup_map_settings['agg'][agg_class]].sum()

            returndict.update(freq_table_agg)
        else:


            #normalize
            total_counts = freq_table['counts'].sum()
            freq_table['fractions'] = [x/total_counts for x in freq_table['counts']]


            freq_table['lc'] = freq_table['category'].map(BBK_settings['mapper'])
            #add unused classes for consistency
            freq_table = freq_table.merge(pd.Series(BBK_settings['mapper'].values(), name='lc'),how='outer', on='lc')
            freq_table['fractions'] = freq_table['fractions'].fillna(0.0)
            freq_table = pd.Series(data=list(freq_table['fractions']), index=freq_table['lc'], name='fraction')


            freq_table_agg = {}
            #aggregate classes
            for agg_class in BBK_settings['agg']:
                key_name = agg_class + str(buffer_radius)
                freq_table_agg[key_name] = freq_table.loc[BBK_settings['agg'][agg_class]].sum()

            returndict.update(freq_table_agg)

    return returndict




#%% Make figures

if __name__ == "__main__":
    #Set settings

    #% Load paths to use
    #imput
    data_path = path_handler.meta_data_stations
    data_path = change_var_if_needed(data_path, 'data input file')


    #output
    savedirectory = path_handler.folders['dashboard_visuals']['map_plot']
    savedirectory = change_var_if_needed(savedirectory, 'figures_output_folder')


    #% what station to plot

    vlinder_to_plot = 'vlinder34'
    vlinder_to_plot = change_var_if_needed(vlinder_to_plot, 'vlinder_to_plot')



    # plot_all_stations = False




    #%recalculate landuse, update tabular data and make figure

    recalculate_landcover_fractions = True
    recalculate_landcover_fractions = change_var_if_needed(recalculate_landcover_fractions, 'recalculate_landcover_fractions')



    update_tabular_data = True
    update_tabular_data = change_var_if_needed(update_tabular_data, 'update_tabular_data')





    #% Style settings

    figure_with_title = False

    add_hist_to_figure = False #by default to False!!


    add_scale_bar = True

    add_north_arrow = True

    add_buffer_circles = False
    print('following style attributes are used:')
    print(' * Add title to figure: ', figure_with_title)
    print(' * Add LC stacked histogram to figure: ', add_hist_to_figure)

    print(' * Add scale bar to figure: ', add_scale_bar)
    print(' * Add north arrow to figure: ', add_north_arrow)
    print(' * Add buffer circles to figure: ', add_buffer_circles)
    yes_or_no = input('Are the style attributes oke? (y/n)')
    if yes_or_no != 'y':
        figure_with_title = change_var_if_needed(figure_with_title, 'add_title_to_figure')
        add_hist_to_figure = change_var_if_needed(add_hist_to_figure, 'add_hist_to_figure')

        add_scale_bar = change_var_if_needed(add_scale_bar, 'add_scale_bar')
        add_north_arrow = change_var_if_needed(add_north_arrow, 'add_norht_arrow')
        add_buffer_circles = change_var_if_needed(add_buffer_circles, 'add_buffer_circles')
    #% Import data

    data = pd.read_csv(data_path)

    vlinderlijst = list(data['VLINDER'].unique())


    print(data[data['VLINDER'] == vlinder_to_plot])


    #% Print all settings

    print('------------------------- SETTINGS --------------------------')
    print(' * Station: ', vlinder_to_plot, )
    print('   - lat: ', data[data['VLINDER'] == vlinder_to_plot]['lat'].iloc[0])
    print('   - lon: ', data[data['VLINDER'] == vlinder_to_plot]['lon'].iloc[0])

    print(' * recalculate landcover: ', recalculate_landcover_fractions)
    print(' * update tabular data: ', update_tabular_data)

    print(' ')
    print(' * datafile: ', data_path)
    print(' * figures folder: ', savedirectory)
    print(' ')

    print('  - add title: ', figure_with_title)
    print('  - add histogram: ', add_hist_to_figure)
    print('  - add scale bar: ', add_scale_bar)
    print('  - add north arrow: ', add_north_arrow)
    print('  - add buffer circles: ', add_buffer_circles)

    print(' -----------------------------------------------------------')


    proceed = input('type y to proceed, anything else to abort! (y?) ')
    if proceed != 'y':
        sys.exit()



    #calculate the landcover fractions if needed
    if recalculate_landcover_fractions:
        data = pd.read_csv(data_path)

        #extract BBK fractions
        BBK_settings = path_handler.BBK_settings

        #load gis functions
        sys.path.append(path_handler.folders['meta_data_folder'])
        import gis_functions as gis

        #check if the station name in in the input data
        if vlinder_to_plot in data['VLINDER'].unique():
            print('Stationname: ', vlinder_to_plot, ' is found in the input data!')

        #location of station
        lat = data[data['VLINDER'] == vlinder_to_plot]['lat'].iloc[0]
        lon = data[data['VLINDER'] == vlinder_to_plot]['lon'].iloc[0]

        #calculate landcover fractions

        landcover = calculate_landuse(lat = lat,
                                      lon = lon,
                                      bufferlist = buffers,
                                      BBK_settings=BBK_settings)




        #update datafile with new landcoverfractions if needed
        if update_tabular_data:

            input_vlinder_row = data[data['VLINDER'] == vlinder_to_plot]


            #Update data
            #update fractions
            for landcover_frac in landcover:

                data.loc[data['VLINDER'] == vlinder_to_plot, landcover_frac] = landcover[landcover_frac]


            #write the updated file

            format_data_file.write_vlinder_data_to_csv(data = data,
                                                        data_path = data_path)




    reread_data = pd.read_csv(data_path)

    figuur = makefigure(station = vlinder_to_plot,
                        save_directory=savedirectory,
                        data = reread_data,
                        add_title=figure_with_title,
                        add_scale=add_scale_bar,
                        add_arrow=add_north_arrow,
                        add_circles = add_buffer_circles,
                        with_stacked_barchart = add_hist_to_figure,
                        add_other_locations_in_plot = add_other_locations_in_plot
                        )


#%% Debug
# data_path = path_handler.meta_data_stations
# # data_path = change_var_if_needed(data_path, 'data input file')


# #output
# savedirectory = path_handler.folders['dashboard_visuals']['map_plot']
# # savedirectory = change_var_if_needed(savedirectory, 'figures_output_folder')

# reread_data = pd.read_csv(data_path)

# figure_with_title = False

# add_hist_to_figure = False #by default to False!!


# add_scale_bar = True

# add_north_arrow = True

# add_buffer_circles = False
# add_other_locations_in_plot = True


# figuur = makefigure(station = 'regenplus3',
#                     save_directory=savedirectory,
#                     data = reread_data,
#                     add_title=figure_with_title,
#                     add_scale=add_scale_bar,
#                     add_arrow=add_north_arrow,
#                     add_circles = add_buffer_circles,
#                     with_stacked_barchart = add_hist_to_figure,
#                     add_other_locations_in_plot = add_other_locations_in_plot
#                     )
