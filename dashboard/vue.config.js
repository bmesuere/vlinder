module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: process.env.CI
    ? '/vlinder/'
    : '/'
}
