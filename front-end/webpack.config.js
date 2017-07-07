const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path')
const merge = require('webpack-merge');
const webpack = require('webpack');

const { env } = process;
const TARGET = env.NODE_ENV;
const PRODUCTION = TARGET === 'production';
const DEVELOPMENT = TARGET === 'development' || !TARGET;
const UPSTREAM_ORIGIN = env.UPSTREAM_ORIGIN || 'http://localhost:4998';

let config = {
  entry: './src/index.tsx',

  output: {
    path: path.resolve('./build'),
    // publicPath: './',
    publicPath: '/static/',
    filename: 'bundle.js',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/assets/index.html',
      favicon: 'src/assets/favicon.png',
      inject: true,
    }),
    new CopyWebpackPlugin([
      { from: 'semantic/dist/semantic.min.css' },
      { from: 'semantic/dist/themes/default/assets/fonts', 'to': './' },
    ]),
  ],

  devtool: '#cheap-module-inline-source-map',

  devServer: {
    contentBase: './build',
    historyApiFallback: {
      index: '/static/',
    },
    port: 4999,
    proxy: {
      '/graphql': {
        target: UPSTREAM_ORIGIN,
        changeOrigin: true,
      },
    },
    noInfo: true,
  },
};

if (PRODUCTION) {
  config = merge(config, {
    devtool: '#source-map',
  });
}

module.exports = config;
