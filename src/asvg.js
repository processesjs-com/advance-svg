import 'whatwg-fetch'
import $ from 'jquery'
import './style.css'
import injectSvg from './js/injectSvg'
import fitSvg from './js/fitSvg'
import { getFirst , getTranslateAttr , setTranslateAttr } from './js/misc'

class ASVG{

  constructor(){
    this.displayBreakpoints = new Map([
      [ 'L', { min:1300 , max:Infinity }],
      [ 'M', { min:850  , max:1300     }],
      [ 'S', { min:350  , max:850      }],
      [ 'T', { min:0    , max:350      }]
    ])
    this.asvgParams = new WeakMap() // Map of all asvg divs
    this.defaultFileLocation = window.ASVG_FILELOCATION ? window.ASVG_FILELOCATION : './'

    // Bind 'this' to all functions that have in the code 'this.'
    Object.getOwnPropertyNames( Object.getPrototypeOf( this ) ).map( key => {
      if( key != 'constructor' && typeof this[key] == 'function' && this[key].toString().match(/\Wthis\./)){
        this[key] = this[key].bind(this)
      }
    })
    this.injectSvgFilters()
  }

  catchError( err ){ console.log( err ) }

  updateAll( event ){
    for(let element of $( 'div[data-asvg]' ) ){
      this.updateElement( element )
    }
  }

  updateElement ( element ){
    let params = this.updateParams( element )
    // 1. Inject SVG file
      new Promise( ( resolve , reject ) => {
        if( !params.injected || params.injected != $( element ).data( 'asvg-show' ) ){
          let fileLocation = $( element ).data( 'asvg-filelocation' ) ? $( element ).data( 'asvg-filelocation' ) : this.defaultFileLocation
          injectSvg( element , fileLocation + $( element ).data( 'asvg-show' ) + '.svg' )
          .then( () => {
            params.injected = $( element ).data( 'asvg-show' )
            params.currentDisplay = null
            resolve()
          })
          .catch( err => {
            $( element ).data( 'asvg-show' , params.injected )
            reject( err )
          } )
        }else{ resolve() }
      } )
    // 2. Fit to display
      .then( () => fitSvg( element , params.targetDisplay ) )
      .then( () => { params.currentDisplay = params.targetDisplay } )
      .catch( err => this.catchError( err ) )
  }

  updateParams( div ){
    if( !this.asvgParams.has( div ) ){
      this.asvgParams.set( div , {
        initial: $( div ).data( 'asvg' ) ,injected:null, currentDisplay:null, targetDisplay:null
      })
    }
    let params = this.asvgParams.get( div )
    for(let [ label , size ] of this.displayBreakpoints.entries()){
      if( div.offsetWidth >= size.min && div.offsetWidth < size.max ){
        if( params.targetDisplay != label ){ params.targetDisplay = label }
        break
      }
    }
    return params
  }

/*
  Private event handling functions mapped to window object
*/
  onPopupCloseClick( popupClose ){
    let popup = getFirst( $( popupClose ).closest('[data-asvg-popup]') )
    if( popup ){ popup.style.visibility = 'hidden' }
  }

  onPopupLinkClick( popuplink ){
    let svg = getFirst( $( popuplink ).closest('svg') )
    let div = getFirst( $( popuplink ).closest('div') )
    if( svg && div ){

      let display = getFirst( $( svg ).find(`[data-asvg-display="${this.asvgParams.get(div).currentDisplay}"]`) )
      let popup   = getFirst( $( svg ).find(`[data-asvg-popup="${popuplink.getAttribute('data-asvg-popuplink')}"]`) )

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

        let popupClose = getFirst( $( popup ).find('.asvg-popup-close') )
        if( ! popupClose ){
          let position = popup.getBBox()
          let parser   = new DOMParser()
          let text     ='<use xmlns="http://www.w3.org/2000/svg" x="'+(position.x+2)+'" y="'+(position.y+2)+
                        '" href="#asvg-popup-close" class="asvg-popup-close" onclick="onPopupCloseClick(this)" />'
          popup.appendChild( parser.parseFromString(text,"text/xml").documentElement )
        }
      }
    }
  }

  onPageLinkClick( pagelink ){
    let id = pagelink.getAttribute('data-asvg-pagelink')
    let div = getFirst( $( pagelink ).closest('div[data-asvg]') )
    if( id && div ){ $( div ).data( 'asvg-show' , id ) ; this.updateAll( )}
    else( catchError( new Error('Couldn\'t find correct id or div') ) )
  }

  injectSvgFilters(){
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

export default new ASVG()
