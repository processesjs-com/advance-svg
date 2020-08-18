export default injectSvg = ( div , url ) => {
  return new Promise( ( resolve , reject ) => {
    loadXML( url )
    .then(  svg => { div.innerHTML = svg ; resolve() } )
    .catch( err => { reject( err ) } )
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
