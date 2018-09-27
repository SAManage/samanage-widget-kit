var path = require('path')
var parentDir=path.join(__dirname,'..')

const commonConfig = {
	entry: {
		example1: path.join(__dirname, '../src/example1/index.js'),
		example2: path.join(__dirname, '../src/example2/index.js'),
		my_first_widget: path.join(__dirname, '../src/my_first_widget/index.js'),
		teamviewer: path.join(__dirname, '../src/teamviewer/index.js'),
		logmein: path.join(__dirname, '../src/logmein/index.js')
	},
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
  parentDir
}
