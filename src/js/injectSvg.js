import Spinner from 'spin'
import trFilterVisio2013 from 'trFilterVisio2013'

const injectSvg = ( div , url ) => {
  return new Promise( ( resolve , reject ) => {
    let spinner = new Spinner().spin( div )
    loadXML( url )
    .then( svgStr => trFilterVisio2013 ( svgStr ) )
    .then( svgStr => { div.innerHTML = svgStr ; spinner.stop() ; spinner = undefined ; resolve() } )
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
