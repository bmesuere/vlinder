# VLINDER dashboard

The dashboard for [VLINDER](http://vlinder.ugent.be/en), built with Vue 3, Vuetify, and Vite. It visualizes weather data served by the API in [`/api`](../api).

## Project setup

```
yarn install
```

### Compile and hot-reload for development

```
yarn dev
```

### Run unit tests

```
yarn test
```

### Lint

```
yarn lint
```

### Compile and minify for production

```
yarn build
```

### Customize configuration

See [Configuration Reference](https://vitejs.dev/config/).

### Environment variables

`VITE_API_URL` sets the API base URL at build time (see `.env.example`). If unset, it falls back to the production API (`https://mooncake.ugent.be/api`), so the samba-share production deploy needs no configuration.

### Node.js version

Node.js version is pinned in [`.nvmrc`](./.nvmrc); see `engines` in `package.json` for the minimum supported version.
