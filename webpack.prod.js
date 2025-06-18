const webpack = require('webpack'),
  { merge } = require('webpack-merge'),
  commonConfig = require('./webpack.common.js');

module.exports = merge(commonConfig, {
  devtool: 'source-map',
  mode: 'production',
  performance: {
    hints: false
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
      'process.env.name': JSON.stringify('production')
    })
  ]
});
