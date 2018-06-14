const path = require('path')
const util = require('./webpack.util')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const OpenBrowserPlugin = require('open-browser-webpack-plugin')
// https://juejin.im/post/5a0c13b3518825329314154d
const config = {
  entry: util.getEntry('./preview'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]/[hash].js',
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  devServer: {
    contentBase: path.resolve(__dirname, ''),
    host: '127.0.0.1',
    port: '3143',
    compress: true,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'url-loader',
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      minify: { //压缩HTML文件
        removeComments: true, //移除HTML中的注释
        collapseWhitespace: false, //删除空白符与换行符
      },
      filename: 'EventEmitter/preview.html',
      hash: true,
      template: './preview/EventEmitter/preview.html',
    }),
    new OpenBrowserPlugin({
      url: 'http://127.0.0.1:3143',
    }),
  ],
}
config.plugins.push()
module.exports = config
