import './style.css'
import injectSvg from './js/injectSvg'
import fitSvg    from './js/fitSvg'
import { getTranslateAttr , setTranslateAttr } from './js/misc'

class ASVG{

/*
  The constructor accepts parameters in a properties object:
    defaultFileLocation - default value: './'
    userErrorHandler - default value: err => alert( err )
    iconMargin - pixels in integer, default value: 2
*/
  constructor( properties ){

    this.properties = properties
    this.ready = false

    this.displayBreakpoints = new Map([
      [ 'L', { min:1100 , max:Infinity }],
      [ 'M', { min:600  , max:1100     }],
      [ 'S', { min:300  , max:600      }],
      [ 'T', { min:0    , max:300      }]
    ])

    this.asvgParams = new WeakMap() // Map all asvg divs

    // Set default properties
    this.defaultFileLocation = ( properties && properties.defaultFileLocation ) ? properties.defaultFileLocation : './'
    this.iconMargin = ( properties && properties.iconMargin ) ? properties.iconMargin : 2
    this.popupTopMargin = ( properties && properties.popupTopMargin ) ? properties.popupTopMargin : 35
    this.popupRightMargin = ( properties && properties.popupRightMargin ) ? properties.popupRightMargin : 10
    this.userErrorHandler = ( this.properties && this.properties.userErrorHandler ) ? this.properties.userErrorHandler : err => {}

    // Bind 'this' to all functions that have in the code 'this.'
    Object.getOwnPropertyNames( Object.getPrototypeOf( this ) ).map( key => {
      if( key != 'constructor' && typeof this[key] == 'function' && this[key].toString().match(/\Wthis\./)){
        this[key] = this[key].bind(this)
      }
    })

    /*
      Insert common svg filters and icons (common.svg file if present) or use a default string.
      Notice that in FireFox, appendChild works asynchroniously, hence using Promise and delay until appendChild is complete.
    */
    let commonSVGPromise = new Promise( ( resolve , reject) => {
      const defaultCommonSvg = `
<svg width="0px" height="0px" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<!--
  This file provides common effects and icons that are added to the Advance SVG graphics.
  -->

<defs>
  <!-- Icon-close hover effect filter -->
  <filter id="asvg-icon-close-filter">
    <!-- Invert colour -->
    <feColorMatrix in="SourceGraphic" type="matrix" values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0"></feColorMatrix>
  </filter>

  <!-- Links hover effect filter -->
  <filter id="asvg-link-filter">
    <!-- Yellow highlight -->
    <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 -1 0 0 0 0 1 0"></feColorMatrix>
  </filter>

  <!-- Icon-close effect filter -->
  <filter id="asvg-popup-filter">
    <!-- Drop shadow -->
    <feGaussianBlur in="SourceAlpha" stdDeviation="6"></feGaussianBlur>
    <feOffset dx="6" dy="6" result="offsetblur"></feOffset>
    <feFlood flood-color="#202020"></feFlood>
    <feComposite in2="offsetblur" operator="in"></feComposite>
    <feMerge>
      <feMergeNode></feMergeNode>
      <feMergeNode in="SourceGraphic"></feMergeNode>
    </feMerge>
  </filter>

  <!-- Icon-close -->
  <g id="asvg-icon-close" >
    <title>Close popup</title>
    <circle cx="15" cy="15" r="15" style="fill: #FAFAFA; opacity: 0.5;" />
    <path d="M 5,5 L 25,25 M 25,5 L 5,25" style="stroke: #1A1A1A; fill: transparent; stroke-linecap: round; stroke-width: 3;" />
  </g>

  <!-- Icon-popuplink -->
  <linearGradient id="asvg-icon-gradient-popuplink" x1="50%" y1="0%" x2="50%" y2="100%">
    <stop offset="0%" stop-color="rgba(30,30,30,1)"></stop>
    <stop offset="100%" stop-color="rgba(30,30,30,0)"></stop>
  </linearGradient>
  <g id="asvg-icon-popuplink" >
    <animateTransform attributeName="transform" type="scale" additive="sum" from="4 4" to="1 1" begin="0s" dur="1s" repeatCount="1"></animateTransform>
    <path fill="url('#asvg-icon-gradient-popuplink')" style="stroke:none;" d="M 15 4.558594 L 11.441406 4.558594 L 11.441406 1 C 11.441406 0.722656 11.214844 0.5 10.941406 0.5 L 1 0.5 C 0.722656 0.5 0.5 0.722656 0.5 1 L 0.5 10.941406 C 0.5 11.214844 0.722656 11.441406 1 11.441406 L 4.558594 11.441406 L 4.558594 15 C 4.558594 15.277344 4.785156 15.5 5.058594 15.5 L 15 15.5 C 15.277344 15.5 15.5 15.277344 15.5 15 L 15.5 5.058594 C 15.5 4.785156 15.277344 4.558594 15 4.558594 Z M 1.5 1.5 L 10.441406 1.5 L 10.441406 10.441406 L 1.5 10.441406 Z M 14.5 14.5 L 5.558594 14.5 L 5.558594 11.441406 L 10.941406 11.441406 C 11.214844 11.441406 11.441406 11.214844 11.441406 10.941406 L 11.441406 5.558594 L 14.5 5.558594 Z M 14.5 14.5 "/>
  </g>

  <!-- Icon-pagelink -->
  <linearGradient id="asvg-icon-gradient-pagelink" x1="0%" y1="50%" x2="100%" y2="50%">
    <stop offset="0%" stop-color="rgba(30,30,30,0)"></stop>
    <stop offset="100%" stop-color="rgba(30,30,30,1)"></stop>
  </linearGradient>
  <g id="asvg-icon-pagelink" >
    <animateTransform attributeName="transform" type="scale" additive="sum" from="4 4" to="1 1" begin="0s" dur="1s" repeatCount="1"></animateTransform>
    <path fill="url('#asvg-icon-gradient-pagelink')" style="stroke:none;" d="M 14.125 0 L 1.875 0 C 0.839844 0 0 0.839844 0 1.875 L 0 4.375 L 1.25 4.375 L 1.25 1.875 C 1.25 1.53125 1.53125 1.25 1.875 1.25 L 14.125 1.25 C 14.46875 1.25 14.75 1.53125 14.75 1.875 L 14.75 14.125 C 14.75 14.46875 14.46875 14.75 14.125 14.75 L 1.875 14.75 C 1.53125 14.75 1.25 14.46875 1.25 14.125 L 1.25 11.625 L 0 11.625 L 0 14.125 C 0 15.160156 0.839844 16 1.875 16 L 14.125 16 C 15.160156 16 16 15.160156 16 14.125 L 16 1.875 C 16 0.839844 15.160156 0 14.125 0 Z M 14.125 0 "/>
    <path fill="url('#asvg-icon-gradient-pagelink')" style="stroke:none;" d="M 7.5 4.117188 L 6.617188 5 L 8.992188 7.375 L 0 7.375 L 0 8.625 L 8.992188 8.625 L 6.617188 11 L 7.5 11.882812 L 11.382812 8 Z M 7.5 4.117188 "/>
  </g>
  <!-- Icon-hyperlink -->
  <g id="asvg-icon-hyperlink" >
    <animateTransform attributeName="transform" type="scale" additive="sum" from="4 4" to="1 1" begin="0s" dur="1s" repeatCount="1"></animateTransform>
    <path fill="url('#asvg-icon-gradient-pagelink')" style="stroke:none;" d="M 14.5 7.5 C 14.222656 7.5 14 7.722656 14 8 L 14 12.5 C 14 13.328125 13.328125 14 12.5 14 L 3.5 14 C 2.671875 14 2 13.328125 2 12.5 L 2 3.5 C 2 2.671875 2.671875 2 3.5 2 L 8 2 C 8.277344 2 8.5 1.777344 8.5 1.5 C 8.5 1.222656 8.277344 1 8 1 L 3.5 1 C 2.121094 1 1 2.121094 1 3.5 L 1 12.5 C 1 13.878906 2.121094 15 3.5 15 L 12.5 15 C 13.878906 15 15 13.878906 15 12.5 L 15 8 C 15 7.722656 14.777344 7.5 14.5 7.5 Z M 14.5 7.5 "/>
    <path fill="url('#asvg-icon-gradient-pagelink')" style="stroke:none;" d="M 11 2 L 13.296875 2 L 7.644531 7.644531 C 7.550781 7.738281 7.496094 7.867188 7.496094 8 C 7.496094 8.132812 7.550781 8.261719 7.644531 8.355469 C 7.738281 8.449219 7.867188 8.503906 8 8.503906 C 8.132812 8.503906 8.261719 8.449219 8.355469 8.355469 L 14 2.710938 L 14 5 C 14 5.277344 14.222656 5.5 14.5 5.5 C 14.777344 5.5 15 5.277344 15 5 L 15 1.5 C 15 1.367188 14.949219 1.238281 14.855469 1.144531 C 14.761719 1.050781 14.632812 1 14.5 1 L 11 1 C 10.722656 1 10.5 1.222656 10.5 1.5 C 10.5 1.777344 10.722656 2 11 2 Z M 11 2 "/>
  </g>

</defs>
</svg>
      `
      let commonSvgEl = document.createElement( 'div' )
      commonSvgEl.setAttribute( 'id' , 'asvg-common-svg' )
      document.body.appendChild( commonSvgEl )
      const maxCounts = 100
      let counter = 0
      while( !document.getElementById('asvg-common-svg') && counter < maxCounts ){ setTimeout( () => counter++ , 10 ) } // Hold until the element is created
      if( document.getElementById('asvg-common-svg') ){
        // Try to inject from file, if unsuccessful, use the default string above
        injectSvg( document.getElementById('asvg-common-svg') , this.defaultFileLocation + 'common.svg' , true )
        .then( resolve() )
        .catch( err => {
          document.getElementById('asvg-common-svg').innerHTML = defaultCommonSvg
          resolve()
        })
      }else{ let err = new Error( 'Could create element for common.svg!' ); reject( err ) }
    } )

    commonSVGPromise.then( () => {
      this.ready = true
      window.dispatchEvent( new Event('asvg-ready') )
    } ).catch( err => this.catchError( err ) )
  }

  isReady(){ return this.ready }

/*
  Global error handler
*/
  catchError( err ){
    console.error( err )
    if( err.name == 'UserError' ) this.userErrorHandler( err )
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
          let fileLocation = element.getAttribute( 'data-asvg-filelocation' ) ? element.getAttribute( 'data-asvg-filelocation' ) : this.defaultFileLocation
          injectSvg( element , fileLocation + element.getAttribute( 'data-asvg-show' ) , false )
          .then( () => {
            params.injected = element.getAttribute( 'data-asvg-show' )
            params.currentDisplay = null
          })
          // 1.1. Add icons
          .then( () => {
            this.addIcons( element , 'asvg-icon-close'     , '" href="#asvg-icon-close" class="asvg-icon-close" onclick="asvg.onPopupCloseClick(this)" />' )
            this.addIcons( element , 'asvg-icon-popuplink' , '" href="#asvg-icon-popuplink" />' )
            this.addIcons( element , 'asvg-icon-pagelink'  , '" href="#asvg-icon-pagelink" />'  )
            this.addIcons( element , 'asvg-icon-hyperlink' , '" href="#asvg-icon-hyperlink" />' )
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

      addIcons( element , iconId , addString ){
        const flatStr = str => str.toLowerCase().replace( /[\s-_]+/g,'' )

        if( document.getElementById( iconId ) ){
          let iconBBox = document.getElementById( iconId ).getBBox()

          for(let targetElement of element.querySelectorAll( '[data-' + iconId + ']' ) ){
            let elBBox = targetElement.getBBox()
            const x={ l: elBBox.x + 2 , c: elBBox.x + elBBox.width/2  - iconBBox.width/2  , r: elBBox.x + elBBox.width  - iconBBox.width - this.iconMargin  }
            const y={ t: elBBox.y + 2 , m: elBBox.y + elBBox.height/2 - iconBBox.height/2 , b: elBBox.y + elBBox.height - iconBBox.height - this.iconMargin }
            let position = { x: x.l , y: y.t } // Top Left by default
            switch( flatStr( targetElement.getAttribute( 'data-' + iconId ) ) ){
              case 'tc': position = { x: x.c , y: y.t }; break
              case 'tr': position = { x: x.r , y: y.t }; break
              case 'ml': position = { x: x.l , y: y.m }; break
              case 'mc': position = { x: x.c , y: y.m }; break
              case 'mr': position = { x: x.r , y: y.m }; break
              case 'bl': position = { x: x.l , y: y.b }; break
              case 'bc': position = { x: x.c , y: y.b }; break
              case 'br': position = { x: x.r , y: y.b }; break
            }
            let parser   = new DOMParser()
            let text     ='<use xmlns="http://www.w3.org/2000/svg" x="' + position.x + '" y="' + position.y + addString
            targetElement.appendChild( parser.parseFromString( text , 'text/xml' ).documentElement )
          }
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

        let newPtX =  popuplinkTranslate.x + popuplinkRect.x - popupRect.x - this.popupRightMargin
        let newPtY =  popuplinkTranslate.y + popuplinkRect.y - popupRect.y + this.popupTopMargin

        let displayRightCorner = displayRect.x + displayTranslate.x + displayRect.width
        let popupRightCorner = popupRect.x + newPtX + popupRect.width
        if( popupRightCorner > displayRightCorner ){ newPtX -= ( popupRightCorner - displayRightCorner ) + this.popupRightMargin }

        let displayBottomCorner = displayRect.y + displayTranslate.y + displayRect.height
        let popupBottomCorner = popupRect.y + newPtY + popupRect.height
        if( popupBottomCorner > displayBottomCorner ){ newPtY -= ( popupBottomCorner - displayBottomCorner )  }

        setTranslateAttr( popup , { x:newPtX , y:newPtY })
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
