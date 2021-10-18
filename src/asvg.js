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
    this.asvgParams = new WeakMap() // Map all asvg divs
    this.defaultFileLocation = window.ASVG_FILELOCATION ? window.ASVG_FILELOCATION : './'

    // Bind 'this' to all functions that have in the code 'this.'
    Object.getOwnPropertyNames( Object.getPrototypeOf( this ) ).map( key => {
      if( key != 'constructor' && typeof this[key] == 'function' && this[key].toString().match(/\Wthis\./)){
        this[key] = this[key].bind(this)
      }
    })

    this.injectStuff()
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

  addIcons( element , selector , addString ){
    for(let targetElement of element.querySelectorAll( selector ) ){
      let position = targetElement.getBBox()
      let parser   = new DOMParser()
      let text     ='<use xmlns="http://www.w3.org/2000/svg" x="'+(position.x+2)+'" y="'+(position.y+2)+addString
      targetElement.appendChild( parser.parseFromString( text , 'text/xml' ).documentElement )
    }
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
  Inject Svg filters and icons
*/
  injectStuff(){
    let filterDiv = document.createElement( 'div' )
    filterDiv.innerHTML = `
      <svg width="0px" height="0px" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>

          <filter id="asvg-invert-color">
            <feColorMatrix in="SourceGraphic" type="matrix" values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0"></feColorMatrix>
          </filter>

          <filter id="asvg-yellow-highlight">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 -1 0 0 0 0 1 0"></feColorMatrix>
          </filter>

          <filter id="asvg-drop-shadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6"></feGaussianBlur>
            <feOffset dx="6" dy="6" result="offsetblur"></feOffset>
            <feFlood flood-color="#202020"></feFlood>
            <feComposite in2="offsetblur" operator="in"></feComposite>
            <feMerge>
              <feMergeNode></feMergeNode>
              <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
          </filter>

          <g id="asvg-icon-close" >
            <title>Close popup</title>
            <circle cx="15" cy="15" r="15" style="fill: #FAFAFA; opacity: 0.5;" />
            <path d="M 5,5 L 25,25 M 25,5 L 5,25" style="stroke: #1A1A1A; fill: transparent; stroke-linecap: round; stroke-width: 3;" />
          </g>

          <linearGradient id="asvg-icon-gradient-popuplink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(30,30,30,0)">
              <animate attributeName="stop-color" values="rgba(30,30,30,0);rgba(30,30,30,1);rgba(30,30,30,0)" dur="4s" repeatCount="indefinite"></animate>
            </stop>
            <stop offset="100%" stop-color="rgba(30,30,30,1)">
              <animate attributeName="stop-color" values="rgba(30,30,30,1);rgba(30,30,30,0);rgba(30,30,30,1)" dur="4s" repeatCount="indefinite"></animate>
            </stop>
          </linearGradient>

          <linearGradient id="asvg-icon-gradient-pagelink" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="rgba(30,30,30,1)">
              <animate attributeName="stop-color" values="rgba(30,30,30,1); rgba(30,30,30,0); rgba(30,30,30,1)" dur="4s" repeatCount="indefinite"></animate>
            </stop>
            <stop offset="100%" stop-color="rgba(30,30,30,0)">
              <animate attributeName="stop-color" values="rgba(30,30,30,0); rgba(30,30,30,1); rgba(30,30,30,0)" dur="4s" repeatCount="indefinite"></animate>
            </stop>
          </linearGradient>

          <g id="asvg-icon-popuplink">
            <path fill="url('#asvg-icon-gradient-popuplink')" style="stroke:none;" d="M 18.75 5.699219 L 14.300781 5.699219 L 14.300781 1.25 C 14.300781 0.90625 14.019531 0.625 13.675781 0.625 L 1.25 0.625 C 0.90625 0.625 0.625 0.90625 0.625 1.25 L 0.625 13.675781 C 0.625 14.019531 0.90625 14.300781 1.25 14.300781 L 5.699219 14.300781 L 5.699219 18.75 C 5.699219 19.09375 5.980469 19.375 6.324219 19.375 L 18.75 19.375 C 19.09375 19.375 19.375 19.09375 19.375 18.75 L 19.375 6.324219 C 19.375 5.980469 19.09375 5.699219 18.75 5.699219 Z M 1.875 1.875 L 13.050781 1.875 L 13.050781 13.050781 L 1.875 13.050781 Z M 18.125 18.125 L 6.949219 18.125 L 6.949219 14.300781 L 13.675781 14.300781 C 14.019531 14.300781 14.300781 14.019531 14.300781 13.675781 L 14.300781 6.949219 L 18.125 6.949219 Z M 18.125 18.125 "/>
          </g>

          <g id="asvg-icon-pagelink">
            <path fill="url('#asvg-icon-gradient-pagelink')" style="stroke:none;" d="M 19.308594 7.511719 L 14.78125 2.984375 C 14.410156 2.609375 14.03125 2.421875 13.65625 2.421875 C 13.144531 2.421875 12.542969 2.8125 12.542969 3.910156 L 12.542969 5.359375 C 6.128906 5.640625 0.789062 10.527344 0.00390625 16.949219 C -0.0273438 17.214844 0.121094 17.46875 0.371094 17.566406 C 0.441406 17.59375 0.511719 17.609375 0.585938 17.609375 C 0.769531 17.609375 0.945312 17.523438 1.058594 17.367188 C 3.21875 14.414062 6.6875 12.652344 10.339844 12.652344 C 11.074219 12.652344 11.816406 12.722656 12.542969 12.867188 L 12.542969 14.414062 C 12.542969 15.515625 13.144531 15.902344 13.65625 15.902344 C 14.03125 15.902344 14.410156 15.714844 14.78125 15.339844 L 19.308594 10.816406 C 20.21875 9.902344 20.21875 8.421875 19.308594 7.511719 Z M 18.480469 9.988281 L 13.953125 14.511719 C 13.867188 14.601562 13.796875 14.65625 13.742188 14.6875 C 13.726562 14.628906 13.714844 14.539062 13.714844 14.414062 L 13.714844 12.394531 C 13.714844 12.121094 13.527344 11.886719 13.265625 11.824219 C 12.300781 11.597656 11.316406 11.480469 10.339844 11.480469 C 8.316406 11.480469 6.300781 11.972656 4.515625 12.898438 C 3.464844 13.445312 2.488281 14.140625 1.628906 14.957031 C 3.175781 10.019531 7.789062 6.515625 13.128906 6.515625 C 13.453125 6.515625 13.714844 6.253906 13.714844 5.929688 L 13.714844 3.910156 C 13.714844 3.789062 13.726562 3.699219 13.742188 3.636719 C 13.796875 3.667969 13.867188 3.726562 13.953125 3.8125 L 18.480469 8.339844 C 18.933594 8.792969 18.933594 9.53125 18.480469 9.988281 Z M 18.480469 9.988281 "/>
          </g>

        </defs>
      </svg>
    `
    filterDiv.style.height   = "0px";
    filterDiv.style.width    = "0px";
    document.body.appendChild( filterDiv )
  }
}

export default ASVG
