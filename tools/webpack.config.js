import path   from 'path'
import HtmlWebpackPlugin    from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CopyPlugin           from 'copy-webpack-plugin'

export default {
	devtool : 'inline-source-map',
	mode    : 'development',
	entry   : {
    index : path.resolve( __dirname,'../src/asvg.js' ),
    main  : path.resolve( __dirname,'../src/main.js' )
  },
	target  : 'web',
	output  : { path : path.resolve( __dirname,'../dist') , filename : '[name].js' },
	plugins : [
		new HtmlWebpackPlugin({ title : 'Advance SVG' , template : './src/index.html', inject : true , chunks : ['main'] }),
    new MiniCssExtractPlugin({ filename: 'style.css' }),
    new CopyPlugin({ patterns: [ { from: './src/*.svg' , to: './dist' } ] })
	],
	module  : { rules: [
      { test: /\.js$/ , exclude: /node_modules/ , use: { loader: 'babel-loader' } },
			{ test: /\.css$/, use: [ { loader: MiniCssExtractPlugin.loader } , { loader: 'css-loader' } ] }
	]}
}
