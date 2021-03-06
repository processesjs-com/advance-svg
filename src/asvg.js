import './style.css'
import injectSvg from './js/injectSvg'
import fitSvg    from './js/fitSvg'
import { getTranslateAttr , setTranslateAttr } from './js/misc'

class ASVG{

  constructor( properties ){
    this.properties = properties

    this.displayBreakpoints = new Map([
      [ 'L', { min:1100 , max:Infinity }],
      [ 'M', { min:600  , max:1100     }],
      [ 'S', { min:300  , max:600      }],
      [ 'T', { min:0    , max:300      }]
    ])
    this.asvgParams = new WeakMap() // Map of all asvg divs
    this.defaultFileLocation = window.ASVG_FILELOCATION ? window.ASVG_FILELOCATION : './'

    // Bind 'this' to all functions that have in the code 'this.'
    Object.getOwnPropertyNames( Object.getPrototypeOf( this ) ).map( key => {
      if( key != 'constructor' && typeof this[key] == 'function' && this[key].toString().match(/\Wthis\./)){
        this[key] = this[key].bind(this)
      }
    })

    this.injectStuff()
  }

  catchError( err ){
    console.error( err )
    if( err.name == 'UserError' ){
      ( this.properties && this.properties.userErrorHandler ) ? this.properties.userErrorHandler( err ) : alert( err )
    }
  }

  updateElement ( element ){
    let params = this.updateParams( element )
    // 1. Inject SVG file
      new Promise( ( resolve , reject ) => {
        if( !params.injected || params.injected != element.getAttribute( 'data-asvg-show' ) ){
          let fileLocation = element.getAttribute( 'data-asvg-filelocation' ) ? element.getAttribute( 'data-asvg-filelocation' ) : this.defaultFileLocation
          injectSvg( element , fileLocation + element.getAttribute( 'data-asvg-show' ) )
          .then( () => {
            params.injected = element.getAttribute( 'data-asvg-show' )
            params.currentDisplay = null
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

  updateAll( event ){
    for(let element of document.querySelectorAll( 'div[data-asvg]' ) ){
      this.updateElement( element )
    }
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

        let popupClose = popup.querySelector('.asvg-popup-close')
        if( ! popupClose ){
          let position = popup.getBBox()
          let parser   = new DOMParser()
          let text     ='<use xmlns="http://www.w3.org/2000/svg" x="'+(position.x+2)+'" y="'+(position.y+2)+
                        '" href="#asvg-popup-close" class="asvg-popup-close" onclick="onASVGPopupCloseClick(this)" />'
          popup.appendChild( parser.parseFromString(text,"text/xml").documentElement )
        }
      }
    }
  }

  onPageLinkClick( pagelink ){
    let id = pagelink.getAttribute('data-asvg-pagelink')
    let element = pagelink.closest('div[data-asvg]')
    if( id && element ){ element.setAttribute( 'data-asvg-show' , id ) ; this.updateElement( element )}
    else( catchError( new Error('Couldn\'t find correct id or div') ) )
  }

/*
  Inject Svg filters and Popup Close shape, and add the OnClick event handlers to the window object
*/
  injectStuff(){
    let filterDiv = document.createElement( 'div' )
    filterDiv.innerHTML = `
      <svg width="0px" height="0px" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>

          <filter id="invert-color">
            <feColorMatrix in="SourceGraphic" type="matrix" values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0"></feColorMatrix>
          </filter>

          <filter id="yellow-highlight">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 -1 0 0 0 0 1 0"></feColorMatrix>
          </filter>

          <filter id="drop-shadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6"></feGaussianBlur>
            <feOffset dx="6" dy="6" result="offsetblur"></feOffset>
            <feFlood flood-color="#202020"></feFlood>
            <feComposite in2="offsetblur" operator="in"></feComposite>
            <feMerge>
              <feMergeNode></feMergeNode>
              <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
          </filter>

          <g id="asvg-popup-close" >
            <title>Close popup</title>
            <circle cx="15" cy="15" r="15" style="fill: #FAFAFA; opacity: 0.5;" />
            <path d="M 5,5 L 25,25 M 25,5 L 5,25" style="stroke: #1A1A1A; fill: transparent; stroke-linecap: round; stroke-width: 3;" />
          </g>

        </defs>
      </svg>
    `
    document.body.appendChild( filterDiv )

    window["onASVGPopupLinkClick"]  = this.onPopupLinkClick
    window["onASVGPopupCloseClick"] = this.onPopupCloseClick
    window["onASVGPageLinkClick"]   = this.onPageLinkClick

  }
}

export default ASVG
