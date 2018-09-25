const HtmlWebPackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const path = require('path')
const { commonConfig, parentDir } = require('./webpack.common.js')

function newHtmlPlugin(folder) {
  return new HtmlWebPackPlugin({
    chunks: [folder],
    template: `./src/${folder}/index.html`,
    filename: `./${folder}/index.html`
  })
}

mergedConfig = Object.assign(
  {}, 
  commonConfig, {
    mode:'development',
    devServer: {
      contentBase: parentDir,
      historyApiFallback: true
    },
    plugins : [
      ...['example1', 'example2'].map(newHtmlPlugin),
    ]
  }
)

module.exports = mergedConfig
