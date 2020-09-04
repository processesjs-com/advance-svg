import Spinner from 'spin'

const injectSvg = ( div , url ) => {
  return new Promise( ( resolve , reject ) => {
    let spinner = new Spinner().spin( div )
    loadXML( url )
    .then(  svg => { div.innerHTML = svg ; spinner.stop() ; spinner = undefined ; resolve() } )
    .catch( err => { spinner.stop() ; spinner = undefined ; reject( err ) } )
  } )
}

const loadXML = url => {
  return new Promise( ( resolve , reject ) => {
    fetch( url )
    .then( res => {
      if( res.ok ){
        res.text()
        .then( xml => { resolve( xml ) } )
        .catch( err => { reject( err ) } )
      }
      else{ reject( Error( url + ' Not found!') ) }
    })
    .catch( err => { reject( err ) } )
  })
}

export default injectSvg
