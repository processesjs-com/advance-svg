import Cheerio from 'cheerio'
import isSvg from 'is-svg'
import { v4 as uuidv4 } from 'uuid'

const commonTransformations = ( origSvg , isCommon ) =>{
  return new Promise( ( resolve , reject ) => {
    console.log( isCommon )
    let svgStr = origSvg.slice(0) // Clone the origSvg string

    /* Create document object */
    const $ = Cheerio.load( svgStr , { ignoreWhitespace: true , xmlMode: true } )

    /*
      Remove viewBox, width and height attributes from the svg tag - these will be set dynamically
    */
    $('svg').removeAttr('width')
    $('svg').removeAttr('height')
    $('svg').removeAttr('viewBox')
    $('a').attr( 'data-asvg-hyperlink' , '' )

    /* Add onClick events */
    $( '[data-asvg-popuplink]' ).attr( 'onclick' , 'asvg.onPopupLinkClick(this)' )
    $( '[data-asvg-pagelink]'  ).attr( 'onclick' , 'asvg.onPageLinkClick(this)'  )

    let ids=[]
    if( !isCommon ){
      // Remove all id attributes from group elements
      $('g').removeAttr('id')

      // List all id attributs
      let elements = $('[id]')
      elements.map( elId => ids.push( $(elements[ elId ]).attr('id') ) )
    }

    // Convert document object to text
    svgStr = $.xml()

    if( !isCommon ){
      // Replace all ids with unique ones
      ids.forEach( id => svgStr = svgStr.split( id ).join( 'asvg-' + uuidv4() ) ) // ReplaceAll
    }

    // Text search - Remove headers
    svgStr = svgStr.replace(/<\?xml.*\?>/gi,'')
    svgStr = svgStr.replace(/<\!DOCTYPE.*>/gi,'')
    svgStr = svgStr.replace(/<\!--.*-->/gi,'')

    // Text search - remove all tabulations, new lines and multiple spaces
    svgStr = svgStr.replace(/\t/g,' ')
    svgStr = svgStr.replace(/\s{2,}/g,' ')

    isSvg( svgStr ) ? resolve( svgStr ) : reject ( new Error ('Transformation filter failed') )
  } )
}

export default commonTransformations