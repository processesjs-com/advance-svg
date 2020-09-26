import Cheerio from 'cheerio'
import { getFirst } from './misc'

const trFilterVisio2013 = ( origSvg ) =>{
  return new Promise( ( resolve , reject ) => {

    let tagsToRemove = new Set( [ 'style' , 'title' , 'desc' ] )
    let svgStr = origSvg.slice(0) // Clone the origSvg string

    // Text search - Remove headers, v-namespace and change overflow style
    svgStr = svgStr.replace(/<\?xml.*\?>/gi,'')
    svgStr = svgStr.replace(/<\!DOCTYPE.*>/gi,'')
    svgStr = svgStr.replace(/<\!--.*-->/gi,'')
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
      // let classRegexp = new RegExp( 'class="' + match[1] + '"',"g" )
      svgStr = svgStr.replaceAll( 'class="' + match[1] + '"' , 'style="' + match[2] + '"' )
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
    const $ = Cheerio.load( svgStr , { ignoreWhitespace: true , xmlMode: true } )

    /*
      Remove viewBox, width and height attributes from the svg tag - these will be set dynamically
    */
    $('svg').removeAttr('width')
    $('svg').removeAttr('height')
    $('svg').removeAttr('viewBox')

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
      if( cpTag.attr('v\:lbl').toLowerCase().replace(/\s+/g,'') == 'activeshape' ){
        console.log( cpTag.closest('g') )
        let gTagSelector = getFirst( cpTag.closest('g') )
        if( gTagSelector ){
          let gTag = $( gTagSelector )
          let name = cpTag.attr('v\:nameU')
          let val  = cpTag.attr('v\:val').match(/^\w+\(([\w,_-\s]+)\)/) ; val = getFirst( val )
          if( name && val ){
            /*
              Set attributes to the g tag based on v:val and v:nameU attribute of the v:cp
              The v:val attribute looks like:
                'VT4(display size)',
                'VT4(popup)', Note: for popups, the v:nameU attribute contains an id
                'VT4(popuplink XX)'
              val is an array of the substrings (split by space) from within VT4( ... ) brackets
            */
            switch( name.toLowerCase().replace( /\s+/g ,'') ){
              case 'display':
                gTag.attr( 'data-asvg-display' , val )
                break
              case 'popuplink':
                gTag.attr( 'data-asvg-popuplink' , val )
                gTag.attr( 'onclick' , 'handlePopupLinkClick(this);' )
                break
              case 'pagelink':
                gTag.attr( 'data-asvg-pagelink' , val )
                gTag.attr( 'onclick' , 'handlePageLinkClick(this);' )
                break
              case 'popup':
                gTag.attr( 'data-asvg-popup' , val )
                gTag.attr( 'onclick' , '' )
                break
              case 'hreftarget':
                let aTag = getFirst( gTag.closest('a') )
                if( aTag ){ $( aTag ).attr('target' , val ) }
                break
              case 'title':
                titles.set( gTag , val )
                break
            }
          }
        }
      }
    } )

    // Remove all tagsToRemove
    for( let tag of tagsToRemove ){ $( tag ).remove() }

    // Set titles
    for( let [ gTag , title ] of titles ){ $( gTag ).append( '<title>' + title + '</title>' ) }

    // Convert document object to text
    svgStr = $.xml()

    // Text search - Remove all 'v:' attributes
    const vattrRegexp = /v:[a-zA-Z]*=\"[\w\s\(\)\.\:-]*\"/
    match = vattrRegexp.exec( svgStr )
    while(match != null){
      /// let vattrRemoveRegexp = new RegExp( match[0] , "g" )
      svgStr = svgStr.replaceAll( match[0] , '' )
      match = vattrRegexp.exec( svgStr )
    }

    // Text search - remove all tabulations, new lines and multiple spaces
    svgStr = svgStr.replace(/\t/g,' ')
    svgStr = svgStr.replace(/\s{2,}/g,' ')

    resolve( svgStr )

  } )
}

export default trFilterVisio2013
