module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: [
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],

  parserOptions: {
    ecmaVersion: 2020
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'no-extra-semi': 'off',
    'semi': ["error", "always"]
  },

  'extends': [
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ]
}
