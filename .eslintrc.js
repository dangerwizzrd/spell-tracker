module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
  },
  env: {
    browser: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  reportUnusedDisableDirectives: true,
  rules: {
    'no-console': 'off',
  },
};
