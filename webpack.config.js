const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");

const devMode = process.env.NODE_ENV !== "production";

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  entry: [ './src/omniSearch.js'],
  output: {
    // below path is assuming this plugin is installed in the leantime subfolder "plugins"
    path: devMode ? path.resolve(__dirname, './../../../public/dist/js/') : path.resolve(__dirname, './dist/js/') ,
    filename: 'omniSearch.js',
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  mode: "production",
};
