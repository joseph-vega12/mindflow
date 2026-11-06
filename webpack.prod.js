const path = require('path');
const webpack = require('webpack'),
  { merge } = require('webpack-merge'),
  commonConfig = require('./webpack.common.js');

module.exports = merge(commonConfig, {
  devtool: 'source-map',
  mode: 'production',
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
      'process.env': JSON.stringify(process.env),
      'process.env.name': JSON.stringify('production'),
      NODE_ENV: 'production'
    })
  ]
});
