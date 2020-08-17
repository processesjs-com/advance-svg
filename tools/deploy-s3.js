import fs   from 'fs'
import path from 'path'
import AWS  from 'aws-sdk'
import gitBranch from 'current-git-branch'
import mime from 'mime-types'

const pathToDist = path.resolve( __dirname , '../dist' )
const Bucket = 'asvg-cdn'

AWS.config.update({region: 'eu-central-1'})
const s3 = new AWS.S3()

if( gitBranch()=='master' ){

  new Promise( ( res , rej ) => {
    fs.readdir( pathToDist , ( err , filenamesToUpload ) => { if( !err ){ res( filenamesToUpload )}else{ rej( err ) }})
  })
  .then( filenamesToUpload => {
    return Promise.all( filenamesToUpload.map( filenameToUpload => { return new Promise ( ( res , rej ) => {
      const uploadParams = {
        Bucket,
        Body: fs.createReadStream( pathToDist + '/' + filenameToUpload ),
        Key: filenameToUpload,
        ContentType:  mime.lookup( filenameToUpload ) || 'application/octet-stream'
      }
      s3.upload ( uploadParams , ( err , uploadedFile ) => {
        if( !err ){ console.log('Uploaded ', uploadedFile.Key ) ; res( uploadedFile.Key ) }else{ rej( err ) }
      })
    })}))
  })
  .then( uploadedFilekeys => {
    return new Promise( ( res , rej ) => {
      s3.listObjects( { Bucket } , ( err , bucketFiles ) => {
        if( !err ){ res( bucketFiles.Contents.filter( bucketFile => !uploadedFilekeys.includes( bucketFile.Key ) ) )}else{ rej( err ) }
      })
    })
  })
  .then( filesToDelete => {
    return Promise.all( filesToDelete.map( fileToDelete => { return new Promise( ( res , rej ) => {
      s3.deleteObject( { Bucket , Key: fileToDelete.Key } , ( err , data ) => {
        if( !err ){ console.log( 'Deleted ', fileToDelete.Key ) ; res( ) }else{ rej( err ) }
      })
    })}))
  })
  .catch( err => console.log( err  ) )

}else{ console.log( 'Deployment must be done only from \'master\' branch!' )}
