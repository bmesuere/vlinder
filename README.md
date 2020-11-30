# VLINDER dashboard

This repository contains the API and dashboard for [VLINDER](http://vlinder.ugent.be/en), a citizen science project in Flanders. The VLINDER network consists of 60 weather stations located in very diverse landscapes. Each station reports weather data every five minutes, which is then exposed using this API and dashboard.

![image](https://user-images.githubusercontent.com/481872/86219125-0c04b880-bb82-11ea-90e9-af77f382d66f.png)

## Quicklinks
- [Project website](http://vlinder.ugent.be/en): also available [in Dutch](http://vlinder.ugent.be).
- [Public version of this dashboard](http://vlinder.ugent.be/dashboard): the latest release is deployed here.
- [API documentation](https://app.swaggerhub.com/apis-docs/bmesuere/VLINDER): the API data is provided as is. We will not be liable for any losses and damages in connection with the use of this data.
- [Development version of this dashboard](https://bmesuere.github.io/vlinder/): the latest commit is deployed here automatically. This might break.

## Repository structure

- `/api`: The backend REST API as a Sinatra application. To run locally, run `bundle install` and `rackup`. Note that you need to be within the Ghent University network for this to work because of a local database access. This code is currently deployed at [https://mooncake.ugent.be/api](https://mooncake.ugent.be/api). Documentation can be found at [https://app.swaggerhub.com/apis-docs/bmesuere/VLINDER](https://app.swaggerhub.com/apis-docs/bmesuere/VLINDER).
- `/dashboard`: Implementation of the dashboard, using Vue and the API in this repository. To run locally, first run `yarn install`, then `yarn serve`. To build, run `yarn build`. The code from the master branch is automatically deployed to [https://bmesuere.github.io/vlinder/](https://bmesuere.github.io/vlinder/).

## Acknowledgements

 A first version of this dashboard was created by students of Ghent University for my data visualization course.
