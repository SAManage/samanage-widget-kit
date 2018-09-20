var webpack = require('webpack')
var path = require('path')
const { commonConfig, parentDir } = require('./webpack.common.js')
var widgetServerConfig = require('../bin/widget-server-config.json').dev

const devServer = {
  https: !!widgetServerConfig.origin.match('https://'),
  contentBase: parentDir,
  historyApiFallback: true,
  host: '127.0.0.1',
  port: 8080,
  disableHostCheck: true,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  proxy:{
    '/platform_widgets/helper/**': {
      target: widgetServerConfig.origin,
      secure: false,
      changeOrigin: true
    },
    '/fejs_assets/dist-widgets/**': {
      target: widgetServerConfig.origin,
      secure: false,
      changeOrigin: true
    },
    '/assets/slds/**': {
      target: widgetServerConfig.origin,
      secure: false,
      changeOrigin: true
    },
    '/assets/**': {
      target: widgetServerConfig.origin + '/rlds',
      secure: false,
      changeOrigin: true
    }
  }
}

mergedConfig = Object.assign(
  {},
  commonConfig, {
    mode:'development',
    devServer
  }
)

module.exports = mergedConfig
