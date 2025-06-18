const path = require('path');
const webpack = require('webpack'),
  { merge } = require('webpack-merge'),
  commonConfig = require('./webpack.common.js');
const Dotenv = require('dotenv-webpack');

module.exports = merge(commonConfig, {
  devtool: 'source-map',
  mode: 'development',
  performance: {
    hints: false
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    liveReload: true,
    open: true,
    port: 3000,
    historyApiFallback: true
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.name': JSON.stringify('development'),
      NODE_ENV: 'development'
    })
  ]
});
