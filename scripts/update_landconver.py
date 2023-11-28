#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to calculate landcover fractions in buffers using the BBK map (flanders only!)
or S2GLC map for buffers outside flanders.

@author: thoverga
"""

import os
from pathlib import Path
import pandas as pd
import rasterio
import geopandas as gpd
import rasterstats
from shapely.geometry import box
# import settings
import settings.landcover_settings as lc_settings


#%% Setup paths
root_path = Path(__file__).resolve().parents[1]
data_path = os.path.join(root_path, 'api', 'data.csv')

update_all = False
update_list = ['vlinder34']

overwrite=True



#%%

def coordinate_to_circular_buffer_geometry(lat_center, lon_center, radius_m, crs):
    """ This function returns a shapely (circular) polygon object with a given radius in meter, in the given coordinate referece frame. """


    circ_geo = gpd.GeoDataFrame(pd.DataFrame(data={'lat': [lat_center], 'lon': [lon_center]}), geometry=gpd.points_from_xy([lon_center], [lat_center]))
    circ_geo = circ_geo.set_crs(epsg = 4326) #inpunt are gps coordinates
    circ_geo = circ_geo.to_crs(crs)

    circ_geo['polygon'] = circ_geo['geometry'].buffer(float(radius_m), resolution=30)

    return circ_geo.iloc[0]['polygon']




def ULTIMATE_read_from_rasterfile(geometry, raster_file_list, return_map_info = False, return_counts = False, none_if_no_overlap = False):
    """ The ultimate GIS-application function takes as arguments an geometry and a (list of) geotiff file(s).
        This function can handle multiple rasters and merges them if nesecary.

        The return depends on the geometry type:
            * If geometry type is a point, the corresponding raster value is returned.
            * if geometry type is a polygon, the return is an array of corresponding raster values inside the geometry.
        """

    # --------------------------------------------------------------------------------------------------------------------------------------
    #--------------------------------------------HELP functions ----------------------------------------------------------------------------
    # --------------------------------------------------------------------------------------------------------------------------------------

    def validate_raster(raster_file_list):
        print('validate raster maps ...')
        categorical_bool = False
        #check raster meta info
        raster_file_dict = {file: {} for file in raster_file_list}
        for raster in raster_file_dict:
            with rasterio.open(raster) as src:
                res_x_y = src.res
                if (not res_x_y[0] == res_x_y[1]) & (abs(float(res_x_y[0]) - float(res_x_y[1]))/float(res_x_y[0]) > 0.05): #if x and y resolution differs more than 5%
                    print('raster map(' + raster + ') has different x and y resolution. This functionality is not included!')
                    sys.exit()
                if not src.crs.linear_units_factor[0] == 'metre':
                    print('raster map unit is not meter but ', str(src.crs.linear_units_factor[0]), ' this functionality is not included!')
                    sys.exit()
                if not src.count == 1:
                    print('There are ', str(src.count) , ' raster bands detected. This functionality is not implemented.')
                    sys.exit()

                if not src.dtypes[0] == 'float32':
                    print('The data type of the grid cells in the raster are no floats. The raster will be considered to be categorical!')
                    categorical_bool = True

                #TODO: check if dtypes of all rasters are the same


                raster_file_dict[raster]['resolution'] = src.res[0]
                raster_file_dict[raster]['crs'] = src.crs


        res_list = [float(raster_file_dict[x]['resolution']) for x in raster_file_dict.keys()]
        if not all((abs(x - res_list[0])/res_list[0]) < 0.05  for x in res_list):
            print('The resolutions of the different maps are not equal, no buffer geometries can be made')
            print(raster_file_dict)
            sys.exit()


        if not len(set([raster_file_dict[x]['crs'] for x in raster_file_dict.keys()])) == 1:
            print('The CRSs of the different DEM maps are not equal, no buffer geometries can be made')
            sys.exit()

        return categorical_bool


    def geometry_in_map(geometry, raster_file):

        if geometry.geom_type == 'Point':
            with rasterio.open(raster_file) as src:
                bounds = src.bounds
                if ((geometry.x < bounds.right) & (geometry.x > bounds.left) & (geometry.y > bounds.bottom) & (geometry.y < bounds.top)):
                    return True
                else:
                    return False

        if geometry.geom_type == 'Polygon':
        #first check if a part of the geometry is contained in the raster
            with rasterio.open(raster_file) as src:
                raster_bounds_polygon = box(src.bounds.left, src.bounds.bottom, src.bounds.right, src.bounds.top)
                if raster_bounds_polygon.contains(geometry): #geometry fully in raster
                    return True, 'fully_contained'
                elif raster_bounds_polygon.intersects(geometry): #part of geometry in raster
                    return True, 'partially'
                else:
                        return False, 'none'

    #---------------------------------------------------------------------------------------------------------------------------------------------------
    #---------------------------------------------------------------------------------------------------------------------------------------------------



    # --------------------------------------------------------VALIDATE INPUT DATA -----------------------------------------------------------------------

    if isinstance(raster_file_list, str): #if there is one tif file
        raster_file_list = [raster_file_list]


    if geometry.geom_type == 'Point':
        print('geometry is Point type, raster value will be returned!')
        geom_type = 'Point'


    elif geometry.geom_type == 'Polygon':
        print('geometry is Polygon type, cropped array will be returned!')
        geom_type = 'Polygon'
        categorical_bool = validate_raster(raster_file_list = raster_file_list)

    else:
        print('geometry type of geometry not supported. Only Point and Polygon are supported.')

    with rasterio.open(raster_file_list[0]) as src:

        raster_CRS = src.crs
        raster_RES = src.res[0]
        raster_spatial_UNIT = src.crs.linear_units_factor[0]
        raster_BANDS = src.count
    raster_info = {
        'crs': raster_CRS,
        'resolution': raster_RES,
        'spatial_unit': raster_spatial_UNIT,
        'bands': raster_BANDS
        }


    #-------------------------------------------------------get POINT value ------------------------------------------------
    if geom_type == 'Point':
        #get map to use
        map_to_use = "None"
        for raster_file in raster_file_list:
            if geometry_in_map(geometry, raster_file):
                map_to_use = raster_file
                break

        if map_to_use == 'None':
            print('The point with coordinats:')
            print('x: ', geometry.x, '  y: ', geometry.y)
            print('is not contained in these maps: ', raster_file_list)
            print('Make shure if the CRS of the geometry is equal to the CRS of the map: ')
            print(raster_CRS.to_string())
            if none_if_no_overlap:
                return None
            else:
                sys.exit()


        #get raster value
        with rasterio.open(map_to_use) as src:
            band_values = [val for val in src.sample([(geometry.x, geometry.y)])]

        value = band_values[0][0]

    # -----------------------------------------------------get POLYGON cropped array -----------------------------------------------------
    # find the maps to use
    if geom_type == 'Polygon':
        maps_to_use = []
        for raster_file in raster_file_list:
            intersect_bool, intersect_info = geometry_in_map(geometry, raster_file)
            if intersect_bool:
                maps_to_use.append(raster_file)
                print('geometry is ', intersect_info, ' contained in ', raster_file)

        #return None if no raster is found that overlaps
        if not bool(maps_to_use):
            print('The polygon with extends:')
            print(geometry.bounds)
            print('is not contained in these maps: ', raster_file_list)
            print('Make shure if the CRS of the geometry is equal to the CRS of the map: ')
            print(raster_CRS.to_string())
            if none_if_no_overlap:
                return None
            else:
                sys.exit()


        # if geometry is encompassed in one raster

        if len(maps_to_use) == 1: #geometry fully contained in raster
            zs = rasterstats.zonal_stats(vectors = geometry,
                                         raster = maps_to_use[0],
                                         band_num=1,
                                         all_touched= True, #if true, inclueds the cells at the boundaries of the polygon
                                         categorical = categorical_bool,
                                         raster_out= True,
                                         # prefix=str(layer)+'_'
                                              )
            if return_counts & categorical_bool: #return frequency table
                category_counts = pd.Series(zs[0]).drop(['mini_raster_affine', 'mini_raster_array', 'mini_raster_nodata'])
                category_counts.name = 'counts'
                category_counts = category_counts.to_frame()
                category_counts['category'] = category_counts.index
                category_counts.reset_index(drop=True, inplace=True)
                return category_counts
            else:
                value = zs[0]['mini_raster_array']

        else: # if geometry overlaps with multiple maps
            print('Cropping and temporary saving rasters...')
            cropped_raster_file_list = []
            i = 0

            #create rectangle around geometry to crop and clip the rasters to.
            geometry_box = box(geometry.bounds[0], geometry.bounds[1],
                               geometry.bounds[2], geometry.bounds[3])

            #create a cropped version for each map that encompasses the geometry bounderies
            for raster in maps_to_use:
                with rasterio.open(raster) as src:
                    out_image, out_transform = rasterio.mask.mask(src, [geometry_box], crop=True)
                    out_meta = src.meta

                out_meta.update({"driver": "GTiff",
                                 "height": out_image.shape[1],
                                 "width": out_image.shape[2],
                                 "transform": out_transform})

                #temporaly save the tif map in the script folder location
                cropped_file = os.path.join(path_handler.folders['meta_data_folder'], 'cropped_raster_' + str(i) + '.tif')
                cropped_raster_file_list.append(cropped_file)
                with rasterio.open(cropped_file, "w", **out_meta) as dest:
                    dest.write(out_image)
                i += 1


            #merge the cropped rasters and temporaly save in the script folder location
            merged_array, merged_affine = rasterio.merge.merge([rasterio.open(x) for x in cropped_raster_file_list])
            merged_meta = src.meta
            merged_meta.update({"driver": "GTiff",
                                 "height": merged_array.shape[1],
                                 "width": merged_array.shape[2],
                                 "transform": merged_affine})

            merged_location = os.path.join(path_handler.folders['meta_data_folder'], 'merged_raster.tif')
            with rasterio.open(merged_location, "w", **merged_meta) as dest:
                    dest.write(merged_array)

            #get local array from the merged raster
            zs = rasterstats.zonal_stats(vectors = geometry,
                                         raster = merged_location,
                                         band_num=1,
                                         all_touched= True, #if true, inclueds the cells at the boundaries of the polygon
                                         categorical = categorical_bool,
                                         raster_out= True,
                                         # prefix=str(layer)+'_'
                                              )
            if return_counts & categorical_bool: #return frequency table
                category_counts = pd.Series(zs[0]).drop(['mini_raster_affine', 'mini_raster_array', 'mini_raster_nodata'])
                category_counts.name = 'counts'
                category_counts = category_counts.to_frame()
                category_counts['category'] = category_counts.index
                category_counts.reset_index(drop=True, inplace=True)
                value = category_counts
            else:
                value = zs[0]['mini_raster_array']

            #Delete the create raster tif files
            for crop_tif in cropped_raster_file_list: os.remove(crop_tif)
            os.remove(merged_location)
    if return_map_info:
        return value, raster_info
    else:
        return value



def calculate_landuse(lat, lon, bufferlist, BBK_settings, s2glc_settings):

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
        buffer_geometry = coordinate_to_circular_buffer_geometry(lat_center=lat,
                                                                     lon_center=lon,
                                                                     radius_m=buffer_radius,
                                                                     crs = BBK_settings['crs'])
        #get cell value frequency table of the geometry on the raster
        freq_table = ULTIMATE_read_from_rasterfile(geometry = buffer_geometry,
                                                       raster_file_list =BBK_settings['files'],
                                                       return_map_info = False,
                                                       return_counts=True,
                                                       none_if_no_overlap=True)
        if freq_table.empty:
            print('no counts collected, try other map')
            backup_map_settings = s2glc_settings

            map_used='S2GLC'
            #get crs from map meta info
            with rasterio.open(backup_map_settings['file']) as gismap:
                backup_crs = gismap.crs

            #make geometry in backup crs
            buffer_geometry = coordinate_to_circular_buffer_geometry(lat_center=lat,
                                                                         lon_center=lon,
                                                                         radius_m=buffer_radius,
                                                                         crs = backup_crs)

            #get cell value frequency table of the geometry on the raster
            freq_table = ULTIMATE_read_from_rasterfile(geometry = buffer_geometry,
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


#%%
# read data
df = pd.read_csv(data_path)

# iterate over the stations to update
if update_all:
    updatedf = df
    # outdf = pd.DataFrame()
else:
    updatedf = df[df['VLINDER'].isin(update_list)]
    # outdf = df[~df['VLINDER'].isin(update_list)]






for _idx, row in updatedf.iterrows():
    print(f' Getting LC fractions for {row["VLINDER"]}')
    # extract lat and lon --> convert to numeric
    lat, lon = float(row['lat']), float(row['lon'])

    # get landcover fractions
    landcover = calculate_landuse(lat = lat,
                                  lon = lon,
                                  bufferlist = lc_settings.buffers,
                                  BBK_settings = lc_settings.BBK_settings,
                                  s2glc_settings=lc_settings.s2glc_settings)


    #update fractions
    for landcover_frac in landcover:
        # overwrite the df
        df.loc[df['VLINDER'] == row["VLINDER"], landcover_frac] = landcover[landcover_frac]




# Overwrite the data
if overwrite:
    df.to_csv(data_path)

