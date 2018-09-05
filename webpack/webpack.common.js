var path = require('path')
var parentDir=path.join(__dirname,'..')

const commonConfig = {
	entry: {
		my_first_widget: path.join(__dirname, '../src/my_first_widget/index.js')
	},
	module: {
		rules: [{
			test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},{
				test: /\.(scss|css)$/,
				loaders: ["style-loader", "css-loader", "less-loader"]
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
    filename: '[name].bundle.js'
  }
}

module.exports = {
  commonConfig,
  parentDir
}
