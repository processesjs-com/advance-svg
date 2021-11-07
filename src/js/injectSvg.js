import Spinner from 'spin'
import addOnClickEvents  from './addOnClickEvents'
import trFilterVisio2013 from './trFilterVisio2013'
import isSvg from 'is-svg'

const injectSvg = ( element , url ) => {
  return new Promise( ( resolve , reject ) => {
    let spinner = new Spinner().spin( element )
    loadXML( url )
    .then( svgStr => {
      if( svgStr.indexOf("Generated by Microsoft Visio") >= 0 ){ trFilterVisio2013( svgStr ) }
      else{ return new Promise( ( resolve , reject ) => isSvg( svgStr ) ? resolve( svgStr ) : reject ( new Error ( url + ' is not SVG file' ) )  ) }
    })
    .then( svgStr => addOnClickEvents( svgStr ) )
    .then( svgStr => { element.innerHTML = svgStr ; spinner.stop() ; spinner = undefined ; resolve() } )
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
      else{ let err = new Error( url + ' Not found!'); err.name='UserError' ; reject( err ) }
    })
    .catch( err => reject( err ) )
  })
}

export default injectSvg
