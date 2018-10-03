var path = require('path')
var parentDir=path.join(__dirname,'..')

const dirNames = ['example1', 'example2', 'my_first_widget', 'teamviewer', 'logmein']
const entry = dirNames.reduce((res, val) => {
	return {
		...res, [val]: path.join(__dirname, `../src/${val}/index.js`)
	}
}, {})

const commonConfig = {
	entry,
	module: {
		rules: [{
			test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},{
				test: /\.(scss|css)$/,
				use: [
					{ loader: 'style-loader'},
					{
						loader: 'css-loader',
						options: {
							modules: true,
							importLoaders: 2
						}
					}
				]
			}
		]
	},
  resolve: {
    alias: {
      shared: path.join(__dirname, '../src')
    }
  },
  output: {
    path: parentDir + '/dist',
    filename: '[name]/[name].bundle.js'
  }
}

module.exports = {
  commonConfig,
  parentDir,
  dirNames
}
