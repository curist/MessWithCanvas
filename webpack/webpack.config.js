var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var precss = require('precss');
var autoprefixer = require('autoprefixer');

module.exports = {
  entry: './app/index.js',
  devtool: 'source-map',
  output: {
    path: 'doc',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: 'doc'
  },
  resolve: {
    alias: {
      app: path.join(__dirname, '..', 'app')
    }
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'eslint',
      }
    ],
    loaders: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'url?limit=10000!img?progressive=true'
      },
      {
        test: /\.css$/,
        loader: 'style!css!postcss'
      },
      {
        test: /\.less$/,
        loader: 'style!css!postcss!less'
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }
    ]
  },
  eslint: {
    configFile: './webpack/eslintrc.js'
  },
  postcss: function() {
    return [precss, autoprefixer];
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.DEBUG': '"*"'
    }),
    new HtmlWebpackPlugin({
      title: 'build by webpack @ ' + new Date(),
      hash: true,
      template: 'index.ejs'
    }),
    new webpack.NoErrorsPlugin(),
  ]
};
