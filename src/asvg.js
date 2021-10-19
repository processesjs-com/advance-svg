import './style.css'
import injectSvg from './js/injectSvg'
import fitSvg    from './js/fitSvg'
import { getTranslateAttr , setTranslateAttr } from './js/misc'
import svgFiltersAndIcons from './js/svgFiltersAndIcons'

class ASVG{

  constructor( properties ){

    this.properties = properties

    this.displayBreakpoints = new Map([
      [ 'L', { min:1100 , max:Infinity }],
      [ 'M', { min:600  , max:1100     }],
      [ 'S', { min:300  , max:600      }],
      [ 'T', { min:0    , max:300      }]
    ])

    this.asvgParams = new WeakMap() // Map all asvg divs

    this.defaultFileLocation = ( properties && properties.defaultFileLocation ) ? properties.defaultFileLocation : './'

    // Bind 'this' to all functions that have in the code 'this.'
    Object.getOwnPropertyNames( Object.getPrototypeOf( this ) ).map( key => {
      if( key != 'constructor' && typeof this[key] == 'function' && this[key].toString().match(/\Wthis\./)){
        this[key] = this[key].bind(this)
      }
    })
  }

/*
  Global error handler
*/
  catchError( err ){
    console.error( err )
    if( err.name == 'UserError' ){
      ( this.properties && this.properties.userErrorHandler ) ? this.properties.userErrorHandler( err ) : alert( err )
    }
  }

/*
  Update event handler and associated functions.
*/

  // updateAll event handler must be attached to window.load and window.resize events
  updateAll( event ){
    for(let element of document.querySelectorAll( 'div[data-asvg]' ) ){
      this.updateElement( element )
    }
  }

    updateElement ( element ){
      let params = this.updateParams( element )
      // 1. Inject SVG file
      new Promise( ( resolve , reject ) => {
        if( !params.injected || params.injected != element.getAttribute( 'data-asvg-show' ) ){

          // Check if one of the common svg filters and icons is already inserted. If no, then insert all
          if( !document.querySelectorAll('#asvg-icon-close') ){
            // Insert all common svg filters and icons
            let insertEl = document.createElement( 'div' )
            insertEl.innerHTML = svgFiltersAndIcons
            insertEl.style.height   = "0px"
            insertEl.style.width    = "0px"
            element.appendChild( insertEl )
          }

          let fileLocation = element.getAttribute( 'data-asvg-filelocation' ) ? element.getAttribute( 'data-asvg-filelocation' ) : this.defaultFileLocation
          injectSvg( element , fileLocation + element.getAttribute( 'data-asvg-show' ) )
          .then( () => {
            params.injected = element.getAttribute( 'data-asvg-show' )
            params.currentDisplay = null
          })
          // 1.1. Add icons
          .then( () => {
            this.addIcons( element , '[data-asvg-icon-close]'     , '" href="#asvg-icon-close" class="asvg-icon-close" onclick="asvg.onPopupCloseClick(this)" />' )
            this.addIcons( element , '[data-asvg-icon-popuplink]' , '" href="#asvg-icon-popuplink" />' )
            this.addIcons( element , '[data-asvg-icon-pagelink]'  , '" href="#asvg-icon-pagelink" />'  )
            resolve()
          })
          .catch( err => {
            element.setAttribute( 'data-asvg-show' , params.injected )
            reject( err )
          } )
        }else{ resolve() }
      } )
      // 2. Fit to display
      .then( () => fitSvg( element , params.targetDisplay ) )
      .then( () => { params.currentDisplay = params.targetDisplay } )
      .catch( err => this.catchError( err ) )
    }

      updateParams( element ){
        if( !this.asvgParams.has( element ) ){
          this.asvgParams.set( element , {
            initial: element.getAttribute( 'data-asvg' ) ,injected:null, currentDisplay:null, targetDisplay:null
          })
        }
        let params = this.asvgParams.get( element )
        for(let [ label , size ] of this.displayBreakpoints.entries()){
          if( element.offsetWidth >= size.min && element.offsetWidth < size.max ){
            if( params.targetDisplay != label ){ params.targetDisplay = label }
            break
          }
        }
        return params
      }

      addIcons( element , selector , addString ){
        for(let targetElement of element.querySelectorAll( selector ) ){
          let position = targetElement.getBBox()
          let parser   = new DOMParser()
          let text     ='<use xmlns="http://www.w3.org/2000/svg" x="'+(position.x+2)+'" y="'+(position.y+2)+addString
          targetElement.appendChild( parser.parseFromString( text , 'text/xml' ).documentElement )
        }
      }

/*
  onClick event handling functions
*/
  onPopupCloseClick( popupClose ){
    let popup = popupClose.closest('[data-asvg-popup]')
    if( popup ){ popup.style.visibility = 'hidden' }
  }

  onPopupLinkClick( popuplink ){
    let svg = popuplink.closest('svg')
    let div = popuplink.closest('div')

    if( svg && div ){

      let display = svg.querySelector(`[data-asvg-display="${this.asvgParams.get(div).currentDisplay}"]`)
      let popup   = svg.querySelector(`[data-asvg-popup="${popuplink.getAttribute('data-asvg-popuplink')}"]`)

      if( display && popup ){
        popup.style.visibility='visible'

        let displayRect   = display.getBBox()
        let popuplinkRect = popuplink.getBBox()
        let popupRect     = popup.getBBox()

        let displayTranslate   = getTranslateAttr( display )
        let popuplinkTranslate = getTranslateAttr( popuplink )

        let rightMargin    = displayTranslate.x + displayRect.width  - ( popuplinkTranslate.x + popupRect.width  ) - 10
        let bottomMargin   = ( displayTranslate.y ) - ( popuplinkTranslate.y + popupRect.height - popuplinkRect.height + 35 )
        let alignX = popuplinkTranslate.x + ( rightMargin < 0 ? rightMargin : 0 )
        let alignY = popuplinkTranslate.y + popupRect.height - popuplinkRect.height + 25 + ( bottomMargin   < 0 ? bottomMargin : 0 )

        setTranslateAttr( popup , { x:alignX , y:alignY })
      }
    }
  }

  onPageLinkClick( pagelink ){
    let id = pagelink.getAttribute('data-asvg-pagelink')
    let element = pagelink.closest('div[data-asvg]')
    if( id && element ){ element.setAttribute( 'data-asvg-show' , id ) ; this.updateElement( element )}
    else( catchError( new Error('Couldn\'t find correct id or div') ) )
  }
}

export default ASVG
