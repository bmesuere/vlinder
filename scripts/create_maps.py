#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to generate the spatial VLINDER maps per station as is used in the dashboard.

Created on Tue Sep 14 15:42:26 2021

@author: thoverga
"""

#%% Imports


import pandas as pd
from pyproj import Proj, transform

from matplotlib_scalebar.scalebar import ScaleBar
from matplotlib.patches import Circle

import contextily as cx
import matplotlib.pyplot as plt
import os, sys
from pathlib import Path

import geopandas as gpd
import shapely

# import csv
# import selenium
# import geckodriver

# import the settings
import settings.maps_settings as map_settings
import settings.landcover_settings as lc_settings #only usd for making barcharts

#%% Setup paths
root_path = Path(__file__).resolve().parents[1]
data_path = os.path.join(root_path, 'api', 'data.csv')

plot_all = False
plot_list = ['vlinder34', 'vlinder02']


#%%
# yrange = xrange/(width/height)
import matplotlib.ticker as ticker
from mpl_toolkits.axes_grid1.inset_locator import inset_axes

def make_stacked_hist(station, data,
                      landcovers=lc_settings.landcovers,
                      landcover_colors=lc_settings.landcover_colors,
                      buffers = lc_settings.buffers,
                      save_directory = map_settings.output_folder):
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

    fig.patch.set_alpha(0.0)
    ax.patch.set_alpha(0.0)

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
               with_stacked_barchart = False,
               landcovers = lc_settings.landcovers,
               landcover_colors = lc_settings.landcover_colors,
               buffers = lc_settings.buffers,
               save_directory = map_settings.output_folder,
               add_other_locations_in_plot = False,
               run_mogrify = True):


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
    xmin = x - (map_settings.xrange/2.) - map_settings.east_displacement
    xmax = x + (map_settings.xrange/2.) - map_settings.east_displacement
    ymin = y - (map_settings.yrange/2.) + map_settings.south_displacement
    ymax = y + (map_settings.yrange/2.) + map_settings.south_displacement
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
    cx.add_basemap(ax, source=map_settings.tilesource,
                   zoom=map_settings.zoomlevel,
                   crs=refstation.crs.to_string())

    ax.axis('off')


    if add_scale:
        ax.add_artist(ScaleBar(1, location='upper right', box_alpha=0))

    if add_title:
        ax.set_title(titel)


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
                          save_directory = save_directory)
        # add the figure to the current axes
        imbar = plt.imread(bar_plot_location)


        newaxbar = fig.add_axes([0.10,0.50,0.40,0.40], anchor='NW', zorder=1)
        newaxbar.imshow(imbar)
        newaxbar.axis('off')

        if add_arrow:
            imarrow = plt.imread(map_settings.north_arrow) # insert local path of the image.
            newaxarrow = fig.add_axes([0.75,0.1,0.15,0.15], anchor='SE', zorder=1)
            newaxarrow.imshow(imarrow)
            newaxarrow.axis('off')

    elif add_arrow:

        im = plt.imread(map_settings.north_arrow) # insert local path of the image.
        newax = fig.add_axes([0.83,0.01,0.15,0.15], anchor='SE', zorder=1)
        newax.imshow(im)
        newax.axis('off')
        fig.tight_layout()



    figpath =os.path.join(save_directory, naam+".png")

    fig.savefig(figpath,
                dpi=scaler,
                bbox_inches='tight',
                pad_inches = 0.0,)
    print('figure for ', naam, ' is saved here: ', figpath)
    if run_mogrify:
        print('Mogrifying the figure to target resolution and removing of any borders:')
        mogrif_command = f'mogrify -trim -fuzz 10% -resize {map_settings.target_width}x{map_settings.target_height}! {figpath}'
        print(f' \n {mogrif_command} \n')
        os.system(mogrif_command)

    return





if __name__ == "__main__":

    # read data
    df = pd.read_csv(data_path)

    # iterate over the stations to plo
    if plot_all:
        to_plot_stations = df['VLINDER'].unique().to_list()
    else:
        to_plot_stations = [sta for sta in df['VLINDER'] if sta in plot_list]

    for station in to_plot_stations:
        print(f' Creating map for  {station}')

        figuur = makefigure(station = station,
                            save_directory=map_settings.output_folder,
                            data = df,
                            add_title=map_settings.figure_with_title,
                            add_scale=map_settings.add_scale_bar,
                            add_arrow=map_settings.add_north_arrow,
                            add_circles = map_settings.add_buffer_circles,
                            with_stacked_barchart = map_settings.add_hist_to_figure,
                            add_other_locations_in_plot = map_settings.add_other_locations_in_plot,
                            run_mogrify=map_settings.run_mogrify
                            )


