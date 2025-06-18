const webpackAlias = require('./webpack.editor').resolve.alias;

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true
  },
  extends: ['plugin:react/recommended', 'standard', 'plugin:prettier/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 11,
    sourceType: 'module'
  },
  plugins: ['react', 'sort-imports-es6-autofix'],
  rules: {
    camelcase: 'off',
    'no-undef': 'warn',
    'no-unused-vars': 'warn',
    'no-use-before-define': 'off',
    'import/no-duplicates': 'off',
    'no-control-regex': 'off',
    'sort-imports-es6-autofix/sort-imports-es6': [
      'warn',
      {
        ignoreCase: true
      }
    ],
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'no-console': 'warn',
    'no-empty-pattern': 'off',
    'no-trailing-spaces': [
      'error',
      {
        skipBlankLines: true
      }
    ],
    'react/destructuring-assignment': ['off', 'never'],
    'prefer-regex-literals': ['warn'],
    ' node/no-path-concat': 0,
    'node/no-deprecated-api': ['warn'],
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',
    'prefer-const': ['warn'],
    'react/jsx-filename-extension': [
      'warn',
      {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      }
    ],
    'react/jsx-uses-react': 'warn', // necessary to prevent undesired no-unused-vars triggering
    'react/jsx-uses-vars': 'warn', // necessary to prevent undesired no-unused-vars triggering
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/explicit-function-return-type': 'off',
    'prettier/prettier': [
      'warn',
      {
        endOfLine: 'auto'
      }
    ],
    'react/jsx-wrap-multilines': [
      'error',
      {
        declaration: false,
        assignment: false
      }
    ],
    'jsx-a11y/label-has-for': 'off'
  },
  settings: {
    'import/resolver': {
      alias: {
        map: Object.keys(webpackAlias).map((k) => [k, webpackAlias[k]]),
        extensions: ['.ts', '.d.ts', '.tsx', '.js', '.jsx', '.json']
      }
    },
    react: {
      version: 'latest'
    }
  }
};
