import path   from 'path'
import HtmlWebpackPlugin    from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import StyleLoader          from 'style-loader'
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
    // new MiniCssExtractPlugin({ filename: 'style.css' }),
    new CopyPlugin({ patterns: [ {
        from:    path.resolve(__dirname, '../svg', '*.svg') ,
        to:      path.resolve(__dirname, '../dist' ),
        context: path.resolve(__dirname, '../svg'  )
      },{
        from:    path.resolve(__dirname, '../src', 'favicon.ico') ,
        to:      path.resolve(__dirname, '../dist' ),
        context: path.resolve(__dirname, '../src'  )
      }
    ] }),
    new RemovePlugin({ before : { include: [ './dist' ] } })
	],
	module  : { rules: [
      { test: /\.js$/ , exclude: /node_modules/ , use: { loader: 'babel-loader' } },
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] } // { loader: MiniCssExtractPlugin.loader } , { loader: 'css-loader' }
	]}
}
