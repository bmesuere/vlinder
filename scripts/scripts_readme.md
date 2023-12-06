## Updating landcover fractions
To calculate the landcover fractions at different buffers for a station, you can use the *update_landcover.py* script. Make sure to work on a specific branch and **merging with the master is always done in a PR**.

### Requirements
To run the *update_landcover.py* you need:
* have a folder with [BBK](https://www.vlaanderen.be/digitaal-vlaanderen/onze-oplossingen/earth-observation-data-science-eodas/remote-sensing-projecten-bij-digitaal-vlaanderen/bodembedekking-en-bodemgebruik-vlaanderen) .tif files. The path to this folder must be set in the *settings/landcover_settings.py*: `BBK_folder= "PATH_TO_THE_FOLDER"`.
* have a folder with the [s2glc](https://s2glc.cbk.waw.pl/) .tif file and update the `s2glc_file="...."` in the *setting/landcover_settings.py* file.
* Because of the [rasterio](https://rasterio.readthedocs.io/en/stable/installation.html) dependency, a system wide installation of [gdal](https://gdal.org/index.html) is required ... . Check the installation descriptions of rasterio for more details.
* A Python(>=3.9) installation with some packages. You can use the `environment.yml` file to set up this conda environment.

### To run

1. Activate your environment `conda activate vlinderkaart_2_env` (comes with spyder as IDE).
2. Check the *settings/landcover_settings.py* file and update the settings to your needs.
3. Check the *update_landcover.py* script and update the `update_all=True` (= to calculate the landcover for all stations) are set it to `False` and specify the stations to update with the `update_list` variable.
4. (Change the coordinates of the *../api/data.csv* file if needed)
5. Run the script: `python3 update_ladcover.py`.
6. The *../api/data.csv* is updated.
  
## Creating maps
The requirements for creating the maps are the same as for the landcover calculations. 

### To Run
1. Activate your environment `conda activate vlinderkaart_2_env` (comes with spyder as IDE).
2. Check the *settings/map_settings.py* file and update the settings to your needs.
3. Check the *create_maps.py* script and update the `plot_all=True` (= to make a map for all stations) set it to `False` and specify the stations to plot with the `update_list` variable.
4. (The coordinates, and landcover, at the *../api/data.csv* file are used.)
5. Run the script: `python3 create_maps.py`.
6. The maps are written to `/output/` .

## Preparing a station update on the dashboard
(If a new station is added, start by finding the ID of the station in the Database (Use a read-only account, UGent VPN, and [phpmyadmin](https://phpmyadmin.private.ugent.be/) to get the ID).

Then follow the checklist:
- [X] Create and switch to a new branch.
- [X] Update the `api/data.csv` file:
  * update the coordinates, make sure you use `.` as a decimal sign.
  * update the locations, sponsor, project etc.
  * add the ID if this is a new station.
  * (no need to delete the landcover-fractions, these will be overwritten)
- [X] Calculate the landcover fractions (see above)
- [X] Create maps for them (see above)
- [X] Copy the maps (in `/output/`) to `resources/img/maps/`
- [X] Copy the maps (in `/output/`) to `resources/img/maps/` and run [imgoptim](https://github.com/JamieMason/ImageOptim-CLI) on them (macOS only)

  
  

