const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [ './src/omniSearch.js'],
  output: {
    // below path is assuming this plugin is installed in the leantime subfolder "plugins"
    path: path.resolve(__dirname, './../../../public/dist/js'),
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
  mode: 'production',
};
