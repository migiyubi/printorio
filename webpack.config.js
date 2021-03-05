const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const WebpackPwaManifest = require("webpack-pwa-manifest");
const WorkBoxWebpackPlugin = require("workbox-webpack-plugin");

const src = path.resolve(__dirname, 'src')
const dist = path.resolve(__dirname, 'dist')

module.exports = {
  context: src,
  entry: './js/main.js',
  output: {
    filename: 'bundle.js',
    path: dist
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 20000,
            name: '[name].[ext]'
          }
        }]
      }
    ]
  },
  resolve: {
    modules: [
      path.join(src),
      path.join(src, 'js'),
      'node_modules'
    ],
    fallback: {
      assert: require.resolve('assert'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      zlib: require.resolve('browserify-zlib')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new HtmlWebpackPlugin({
      template: './html/index.html',
      inject: 'head'
    }),
    new CopyPlugin({
      patterns: [
        { from: src + '/assets', to: dist + '/assets' }
      ]
    }),
    new WebpackPwaManifest({
      short_name: 'FBP Viewer',
      name: 'Factorio Blueprint Viewer',
      display: 'standalone',
      start_url: 'index.html',
      background_color: '#000000',
      theme_color: '#000000',
      icons: [{
        src: path.join(src, 'icon_512.png'),
        destination: path.join('assets', 'icons'),
        sizes: [192, 512],
      }],
      fingerprints: false,
      publicPath: './',
    }),
    new WorkBoxWebpackPlugin.GenerateSW({
      inlineWorkboxRuntime: true
    })
  ],
  mode: 'production'
};
