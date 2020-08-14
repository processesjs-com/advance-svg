import Cheerio from 'cheerio'
import { getFirst } from './misc'

const trFilterVisio2013 = ( origSvg ) =>{
  return new Promise( ( resolve , reject ) => {
    let svg = origSvg.slice(0) // Clone the svgOrigFile string
    let tagsToRemove = new Set(['style','title','desc'])

    /* 
      Text search and replace:
      Remove headers, v-namespace and change overflow style
    */
    svg = svg.replace(/<\?xml.*\?>/gi,'')
    svg = svg.replace(/<\!DOCTYPE.*>/gi,'')
    svg = svg.replace(/<\!--.*-->/gi,'')
    svg = svg.replace('xmlns:v="http://schemas.microsoft.com/visio/2003/SVGExtensions/"','')
    svg = svg.replace('overflow:visible','overflow:hidden')

    /*  
      Text search and replace: 
      Move the styles for the stylesheet to inline 
      1. Find the style definitions (see stRegexp) like 
        .st1 {...}
        .st2 {...} etc.
        The first group is the class name e.g. 'st1', 'st2' ...
        The second group is the definition inside the curly brackets
      2. Loop in all definitions and replace all class="stXX" with an inline style="..."
        see (classRegexp)
    */
    let stRegexp = /\.(st\d*)\s{([\w\s\:\(\)\#\.,;-]*)}/gi
    let match = stRegexp.exec( svg )
    while( match != null ){
      let classRegexp = new RegExp( 'class="'+match[1]+'"',"g" )
      svg = svg.replace( classRegexp , 'style="'+match[2]+'"' )
      match = stRegexp.exec( svg )
    }

    /* 
      Text search:
      Find all 'v:' tags (see vRegexp) and add them to tagsToRemove for further removal via jQuery
    */
    let vRegexp = /<(v:[a-zA-Z]*)/gi
    match = vRegexp.exec( svg )
    while( match != null ){
      tagsToRemove.add( match[1].replace(':','\\:') )
      match = vRegexp.exec( svg )
    }

    /* Turn the text to document object */
    const $ = Cheerio.load( svg , {
      ignoreWhitespace: true,
      xmlMode: true
    })

    /*
      Make changes to all 'activeShape' elements:
      1. Serch for v:cp tags,
      2. If attr v:lbl == "activeShape", continue
      3. Get the closest g tag and the value from v:val attribute
      4. Switch according to the v:val value 
    */
    let titles = new Map()
    let cps = $('v\\:cp')
    cps.map( cpI => {
      let cp = $( cps[cpI] )
      if( cp.attr('v\:lbl').toLowerCase().replace(/\s+/g,'') == 'activeshape' ){       
        let cg = getFirst( cp.closest('g') )
        if( cg ){
          let gTag = $( cg )
          let name = cp.attr('v\:nameU')
          let val  = cp.attr('v\:val').match(/^\w+\(([\w,_-\s]+)\)/)
          if( val && val.length > 1 ){ val=val[1] }
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
                gTag.attr( 'data-amaps-display' , val ) 
                break
              case 'popuplink':
                gTag.attr( 'data-amaps-popuplink' , val ) 
                gTag.attr( 'onclick' , 'handlePopupLinkClick(this);' )
                break
              case 'maplink':
                gTag.attr( 'data-amaps-maplink' , val ) 
                gTag.attr( 'onclick' , 'handleMapLinkClick(this);' )
                break
              case 'popup':
                gTag.attr( 'data-amaps-popupid' , val )
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
  
    /*  
      Remove viewBox, width and height attributes from the svg tag - they will be set dynamically 
    */
    $('svg').removeAttr('width')
    $('svg').removeAttr('height')
    $('svg').removeAttr('viewBox')

    /* 
      Remove all from tagsToRemove
    */
    for( let tag of tagsToRemove ){ $( tag ).remove() }

    /* 
      Set titles
    */
    for( let [ gTag , title ] of titles ){ $( gTag ).append( '<title>' + title + '</title>' ) }

    /* Convert document object to text */
    svg = $.xml()
    
    /* 
      Text search:
      Remove all 'v:' attributes 
    */
    let vattrRegexp = /v:[a-zA-Z]*=\"[\w\s\(\)\.\:-]*\"/
    match = vattrRegexp.exec( svg )
    while(match != null){
      let vattrRemoveRegexp = new RegExp( match[0] , "g" )
      svg = svg.replace( vattrRemoveRegexp , '' )
      match = vattrRegexp.exec( svg )
    }
    
    /* 
      Text search:
      remove all tabulations, new lines and multiple spaces
    */
    svg=svg.replace(/\t/g,' ')
    svg=svg.replace(/\s{2,}/g,' ')

    resolve( svg )

  } )
}

export default trFilterVisio2013
