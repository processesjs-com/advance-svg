import path   from 'path'
import HtmlWebpackPlugin    from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CopyPlugin           from 'copy-webpack-plugin'
import RemovePlugin         from 'remove-files-webpack-plugin'

export default {
	devtool : 'inline-source-map',
	mode    : 'development',
	entry   : {
    asvg  : path.resolve( __dirname,'../src/asvg.js' ),
    bundle: path.resolve( __dirname,'../src/main.js' )
  },
	target  : 'web',
	output  : { path : path.resolve( __dirname,'../dist') , filename : '[name].js' },
	plugins : [
		new HtmlWebpackPlugin({ title : 'Advance SVG' , template : './src/index.html', inject : true , chunks : ['bundle'] }),
    new MiniCssExtractPlugin({ filename: 'style.css' }),
    new CopyPlugin({ patterns: [ {
      from:    path.resolve(__dirname, '../svg', '*.svg') ,
      to:      path.resolve(__dirname, '../dist' ),
      context: path.resolve(__dirname, '../svg'  ),
    } ] }),
    new RemovePlugin({
      after: { root: path.resolve(__dirname, '../dist' ) , test: [ 'style.css','style.css.map' ] }
    })
	],
	module  : { rules: [
      { test: /\.js$/ , exclude: /node_modules/ , use: { loader: 'babel-loader' } },
      { test: /\.css$/, use: [ { loader: MiniCssExtractPlugin.loader } , { loader: 'css-loader' } ] }
	]}
}
