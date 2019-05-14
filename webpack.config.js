const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
module.exports = {
  entry:{
    background: './src/background/background.js',
    page: './src/page/page.js',
    popup: './src/popup/popup.js',
    'content-script': './src/page/eventRecorder.js'
  },
  output: {
    path: path.join(__dirname, '/build'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
    ]
  },
  plugins:[
    new CopyPlugin([
      { from: './src/manifest.json', to: './manifest.json' },
    ]),
    new HtmlWebpackPlugin({
      template: './src/popup/popup.html',
      chunks: ['popup']})
  ]
}