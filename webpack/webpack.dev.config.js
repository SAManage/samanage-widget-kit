var webpack = require('webpack')
var path = require('path')
var parentDir = path.join(__dirname,'..')
var widgetServerConfig = require('../bin/widget-server-config.json').dev

module.exports = {
  mode:'development',
	entry: [
		path.join(__dirname, '../index.js')
	],
	module: {
		rules: [{
			test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},{
				test: /\.(scss|css)$/,
				loaders: ['style-loader', 'css-loader?modules=true&camelCase=true']
			}
		]
	},
  output: {
    path: parentDir + '/dist',
    filename: 'bundle.js'
  },
  devServer: {
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
      '/assets/**': {
        target: widgetServerConfig.origin + '/rlds',
        secure: false,
        changeOrigin: true
      }
    }
  }
}
