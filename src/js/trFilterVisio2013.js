import * as cheerio from 'cheerio'
import { getFirst } from './misc'

const flatStr = str => str.toLowerCase().replace( /[\s-_]+/g,'' )

const trFilterVisio2013 = ( origSvg ) =>{
  return new Promise( ( resolve , reject ) => {

    let tagsToRemove = new Set( [ 'style' , 'title' , 'desc' ] )
    let svgStr = origSvg.slice(0) // Clone the origSvg string

    // Text search - Remove v-namespace and change overflow style
    svgStr = svgStr.replace('xmlns:v="http://schemas.microsoft.com/visio/2003/SVGExtensions/"','')
    svgStr = svgStr.replace('overflow:visible','overflow:hidden')

    /*
      Text search and replace:
      Move styles for stylesheet to inline
      1. Find the style definitions (see stRegexp) like
        .st1 {...}
        .st2 {...} etc.
        The first RegExpr group is the class name e.g. 'st1', 'st2' ...
        The second group is the definition inside the curly brackets
      2. Search and replace all class="stXX" with style="..."
        see (classRegexp)
    */
    const stRegexp = /\.(st\d*)\s{([\w\s\:\(\)\#\.,;-]*)}/gi
    let match = stRegexp.exec( svgStr )
    while( match != null ){
      /*
         String.prototype.replaceAll is since Chrome v. 85 and does not work in nodejs
         The command below, shall be replaced when replaceAll is widely available
         svgStr.replaceAll( 'class="' + match[1] + '"' , 'style="' + match[2] + '"' )
         Here is a variant for replace with a RegExp
         let classRegexp = new RegExp( 'class="' + match[1] + '"',"g" )
      */
      svgStr = svgStr.split( 'class="' + match[1] + '"' ).join( 'style="' + match[2] + '"' )
      match = stRegexp.exec( svgStr )
    }

    /*
      Text search:
      Find all 'v:' tags (see vRegexp) and add them to tagsToRemove for further removal via jQuery
    */
    const vRegexp = /<(v:[a-zA-Z]*)/gi
    match = vRegexp.exec( svgStr )
    while( match != null ){
      tagsToRemove.add( match[1].replace(':','\\:') )
      match = vRegexp.exec( svgStr )
    }

    /* Create document object */
    const $ = cheerio.load( svgStr , { ignoreWhitespace: true , xmlMode: true } )

    /*
      Make changes to all 'activeShape' elements:
      1. Serch for v:cp tags,
      2. If attr v:lbl == "activeShape", continue
      3. Get the closest g tag and the value from v:val attribute
      4. Switch according to the v:val value
    */
    let titles = new Map()

    let cpTags = $('v\\:cp')
    cpTags.map( cpTagIndex => {
      let cpTag = $( cpTags[ cpTagIndex ] )
      if( flatStr( cpTag.attr('v\:lbl' ) ) == 'activeshape' ){
        let gTagSelector = getFirst( cpTag.closest('g') )
        if( gTagSelector ){
          let gTag = $( gTagSelector )
          let name = cpTag.attr('v\:nameU')
          let val  = cpTag.attr('v\:val').match(/^\w+\(([\w,_-\s\.]+)\)/)
          if( val && val.length > 1 ){ val=val[1] }
          if( name && val ){
            /*
              Set attributes to the g tag based on v:val and v:nameU attribute of the v:cp tag
            */
            switch( flatStr( name ) ){
              case 'popup' : gTag.attr( 'data-asvg-popup' , val ) ; break
              case 'title' : titles.set( gTag , val ) ; break
              case 'display'    : gTag.attr( 'data-asvg-display' , val ) ; break
              case 'annotation' : $( gTag ).remove() ; break
              case 'popuplink'  : gTag.attr( 'data-asvg-popuplink' , val ) ; break
              case 'pagelink'   : gTag.attr( 'data-asvg-pagelink' , val ) ; break
              case 'iconclose'  : gTag.attr( 'data-asvg-icon-close' , val ) ; break
              case 'iconpopuplink' : gTag.attr( 'data-asvg-icon-popuplink' , val ) ; break
              case 'iconpagelink'  : gTag.attr( 'data-asvg-icon-pagelink' , val ) ; break
              case 'iconhyperlink' : gTag.attr( 'data-asvg-icon-hyperlink' , val ) ; break
              case 'hreftarget' :
                let aTag = getFirst( gTag.closest('a') )
                if( aTag ){ $( aTag ).attr('target' , val ) }
                break
            }
          }
        }
      }
    } )

    // Remove  all tagsToRemove
    for( let tag of tagsToRemove ){ $( tag ).remove() }

    // Set titles
    for( let [ gTag , title ] of titles ){ $( gTag ).append( '<title>' + title + '</title>' ) }

    // Check all popups if have iconclose. If not, add by default a closeing icon at the top-left corner
    let popUps = $('[data-asvg-popup]')
    popUps.map( popUpIndex => {
      let popUp = $( popUps[ popUpIndex ] )
      if( !popUp.attr( 'data-asvg-icon-close' ) ) popUp.attr( 'data-asvg-icon-close' , 'tl' )
    })

    // Convert document object to text
    svgStr = $.xml()

    // Text search - Remove all 'v:' attributes
    const vattrRegexp = /v:[a-zA-Z]*=\"[\w\s\(\)\.\:-]*\"/
    match = vattrRegexp.exec( svgStr )
    while(match != null){
      /// let vattrRemoveRegexp = new RegExp( match[0] , "g" )
      svgStr = svgStr.split( match[0] ).join( '' ) // See above note about replaceALL: replaceAll( match[0] , '' )
      match = vattrRegexp.exec( svgStr )
    }

    resolve( svgStr )

  } )
}

export default trFilterVisio2013
