/*
    This script shall be used on the Bulid Server to push to GitHub.

    Note: 'node_modules' and 'dist' folders are in .gitignore list
*/

import shell from 'shelljs'

shell.exec('git status' , ( code , stdout , stderr ) => {
  if( code == 0 ){
    if( !stdout.includes( 'nothing to commit' ) ){ return shell.exec( 'git add . && git commit -m "Build complete" && git push' ).code }
    return 0
  }
  return 1
})
