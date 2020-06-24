# VLINDER dashboard

This repository contains the API and dashboard for the [VLINDER project](http://vlinder.ugent.be/en).

## Quicklinks
- [Project website](http://vlinder.ugent.be/en): also available [in Dutch](http://vlinder.ugent.be).
- [Public version of this dashboard](http://vlinder.ugent.be/dashboard): the latest release is deployed here.
- [API documentation](https://app.swaggerhub.com/apis-docs/bmesuere/VLINDER): although the code in this repository is licensed under the MIT License, the data itself is not. Please contact vlinder@ugent.be if you want to actively use the API.
- [Development version of this dashboard](https://bmesuere.github.io/vlinder/): the latest commit is deployed here automatically. This might break.

## Repository structure

- `/api`: The backend REST API as a Sinatra application. To run locally, run `bundle install` and `rackup`. Note that you need to be within the Ghent University network for this to work because of a local database access. This code is currently deployed at [https://mooncake.ugent.be/api](https://mooncake.ugent.be/api). Documentation can be found at [https://app.swaggerhub.com/apis-docs/bmesuere/VLINDER](https://app.swaggerhub.com/apis-docs/bmesuere/VLINDER).
- `/dashboard`: Implementation of the dashboard, using Vue and the API in this repository. To run locally, first run `yarn install`, then `yarn serve`. To build, run `yarn build`. The code from the master branch is automatically deployed to [https://bmesuere.github.io/vlinder/](https://bmesuere.github.io/vlinder/).

## Acknowledgements

 A first version of this dashboard was created by students of Ghent University for my data visualization course.