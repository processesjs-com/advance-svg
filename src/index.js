import 'whatwg-fetch'
import $ from 'jquery'
import './style.css'
import { getFirst , getTranslateAttr , setTranslateAttr } from './js/misc'
import { injectSVG , fitSVG } from './js/injectAndFitSVG'

class ASVG{

  constructor(){
    this.svgParams            = new WeakMap()
    this.handlePopupLinkClick = this.handlePopupLinkClick.bind(this)
    this.handleSvgLinkClick   = this.handleSvgLinkClick.bind(this)
    this.updateParams         = this.updateParams.bind(this)
    this.handleWindowLoad     = this.handleWindowLoad.bind(this)
    this.handleWindowResize   = this.handleWindowResize.bind(this)
    this.commonWindowEventHandling = this.commonWindowEventHandling.bind(this)
  }

  updateParams( div ){
    const displaySizes = new Map([
      [ 'L', { min:1300 , max:Infinity }],
      [ 'M', { min:850  , max:1300     }],
      [ 'S', { min:350  , max:850      }],
      [ 'T', { min:0    , max:350      }]
    ])

    if( !this.svgParams.has(div) ){
      this.svgParams.set( div , {
        injected:null, currentDisplay:null, targetDisplay:null
      })
    }

    for(let [ label , size ] of displaySizes.entries()){
      if( div.offsetWidth >= size.min && div.offsetWidth < size.max ){
        let svg=this.svgParams.get( div )
        if( svg.targetDisplay != label ){ svg.targetDisplay = label }
        break
      }
    }
  }

  commonWindowEventHandling( ){
    for(let div of $( document ).find( 'div[data-asvg]' ) ){
      this.updateParams( div )
      let params = this.svgParams.get( div )
      if( ! params.injected || params.injected != div.getAttribute('data-asvg') ){
        injectSvg( div , div.getAttribute('data-asvg') )
        .then( div => {
          params.injected = div.getAttribute('data-asvg')
          return fitSvg ( div , params.targetDisplay )
        })
        .then( () => params.currentDisplay = params.targetDisplay )
        .catch( err => console.log( err ) ) }
      else {
        fitSvg ( div , params.targetDisplay )
        .then( () => params.currentDisplay = params.targetDisplay )
        .catch( err => console.log( err ) )
      }
    }
  }

  handleWindowLoad( event ){
    /*
      Add color filters and closing sign to document
    */
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

    this.commonWindowEventHandling()
  }

  handleWindowResize( event ){ this.commonWindowEventHandling() }

  handlePopupCloseClick( popupClose ){
    let popup = getFirst( $( popupClose ).closest('[data-asvg-popupid]') )
    if( popup ){ popup.style.visibility = 'hidden' }
  }

  handlePopupLinkClick( popuplink ){

    let svg = getFirst( $( popuplink ).closest('svg') )
    let div = getFirst( $( popuplink ).closest('div') )
    if( svg && div ){

      let display = getFirst( $( svg ).find(`[data-asvg-display="${this.mapsParams.get(div).currentDisplay}"]`) )
      let popup   = getFirst( $( svg ).find(`[data-asvg-popupid="${popuplink.getAttribute('data-amaps-popuplink')}"]`) )

      if( display && popup ){
        popup.style.visibility='visible'

        let displayRect   = display.getBBox()
        let popuplinkRect = popuplink.getBBox()
        let popupRect     = popup.getBBox()

        let displayTranslate   = getTranslateAttr( display )
        let popuplinkTranslate = getTranslateAttr( popuplink )
        let popupTranslate     = getTranslateAttr( popup )

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
                        '" href="#asvg-popup-close" class="asvg-popup-close" onclick="handlePopupCloseClick(this);" />'
          popup.appendChild( parser.parseFromString(text,"text/xml").documentElement )
        }
      }
    }
  }

  handleSvgLinkClick( svglink ){
    let div = getFirst( $( svglink ).closest('div') )
    let id = svglink.getAttribute('data-asvg-svglink')
    if( div && id ){
      let params = this.svgParams.get( div )
      injectSvg( div , id )
      .then( div => {
        div.setAttribute( 'data-asvg' , id )
        params.injected = id
        return fitSvg ( div , params.targetDisplay )
      } )
      .then( () => params.currentDisplay = params.targetDisplay )
      .catch( err => console.log( err ) )
    }
  }
}

export default new ASVG()

/*
  Developer Notes:

  To show and hide shapes need to use style.visibility only, because style.display causes issues
  with getBBox when element is not visible

  Popup translation can be done either from getBBox() coordinates or from getBoundingClientRect()
  However, both methods have issues when the shapes' centers are not in 0, 0
  getBoundingClientRect will not work if set width and height of the svg tag different from the viewBox
  getBBox will not work with rotated shapes
  Therefore some sacriface with functionality is necessary.

  getBoundingClientRect based solution

  let displayRect   = display.getBoundingClientRect()
  let popuplinkRect = popuplink.getBoundingClientRect()
  let popupRect     = popup.getBoundingClientRect()

  let rightMargin    = displayRect.right  - ( popuplinkRect.left + popupRect.width ) - 10
  let bottomMargin   = displayRect.bottom - ( popuplinkRect.top  + popupRect.height ) - 10
  let popupTranslate = getTranslateAttr( popup )
  let alignLeft = popupTranslate.x + popuplinkRect.left - popupRect.left + ( rightMargin  < 0 ? rightMargin  : 0 )
  let alignTop  = popupTranslate.y + popuplinkRect.top  - popupRect.top  + ( bottomMargin < 0 ? bottomMargin : 0 )
  setTranslateAttr( popup , { x:alignLeft , y:alignTop })

*/
