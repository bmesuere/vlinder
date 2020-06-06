# VLINDER dashboard

This repository contains the API and dashboard for the [VLINDER project](http://www.vlinder.ugent.be/). A first version of this dashboard was created by students of Ghent University for my data visualization course.

## Repository structure

- `/API`: The backend rest API as a flask application. To run locally, run `python3 main.py`. Note that you need to be within the Ghent University network for this to work because of a local database access. This code is currently deployed at [https://mooncake.ugent.be/api](https://mooncake.ugent.be/api).
- `/vlinder`: The first version of the dashboard created by students. To run locally, first run `npm install`, then `npm run serve`. To build, run `npm run build`. This code is currently deployed at [https://mooncake.ugent.be/dashboard](https://mooncake.ugent.be/dashboard).
- `/dashboard`: Reimplementation of the dashboard, **currently under construction**. To run locally, first run `yarn install`, then `yarn serve`. To build, run `yarn build`. The code from the master branch is automatically deployed to [https://bmesuere.github.io/vlinder/](https://bmesuere.github.io/vlinder/).
