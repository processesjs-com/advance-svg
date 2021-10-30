/*
    This script shall be used on the Bulid Server to pull from GitHub.
    If there are changes in package.json, the script runs 'npm prune && npm install' to update the dependencies.

    Note: 'node_modules' and 'dist' folders are in .gitignore list
*/

import shell from 'shelljs'

shell.exec('git pull' , ( code , stdout , stderr ) => {
  if( code == 0 ){
    if( stdout.includes('package.json') ){ return shell.exec( 'npm prune && npm install' ).code }
    return 0
  }
  return 1
})
