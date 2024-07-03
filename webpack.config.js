const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const select2 = require('select2');

module.exports = {
  entry: [ './src/omniSearch.js'],
  output: {
    // below path is assuming this plugin is installed in the leantime subfolder "plugins"
    path: path.resolve(__dirname, './../../public/dist/js'),
    filename: 'omniSearch.js',
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new webpack.ProvidePlugin({
      select2: 'select2',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  mode: 'production',
};
