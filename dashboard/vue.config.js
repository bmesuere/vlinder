module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: process.env.CI
    ? '/vlinder/'
    : '/dashboard/',
  pwa: {
    manifestOptions: {
      name: 'VLINDER dashboard',
      short_name: 'VLINDER',
      theme_color: '#005eb6'
    }
  }
};
