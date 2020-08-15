import gitBranch from 'current-git-branch'
import webpack   from 'webpack'
import wpConfig  from './webpack.config'

// If master branch, set up for production
if( gitBranch() == 'master' ){
  wpConfig.devtool = 'source-map'
  wpConfig.mode    = 'production'
  process.env.NODE_ENV = 'production'
  console.log('Building master branch in Production mode.' )
}else{
  process.env.NODE_ENV = 'development'
  console.log('Building ' + gitBranch() + ' branch in Development mode.' )
}

webpack( wpConfig , (err,stats) => {
	if( err ){ console.error( err ) ; return 1 }
	const info = stats.toJson()
	if( stats.hasErrors()   ) console.error( info.errors )
	if( stats.hasWarnings() ) console.warn ( info.warnings )
  if( !stats.hasErrors() && !stats.hasWarnings() ){
    console.log( 'Build looks good!' )
    return 0
  }
  return 1
})
