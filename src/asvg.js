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
    this.userErrorHandler = ( this.properties && this.properties.userErrorHandler ) ? this.properties.userErrorHandler : err => alert(err)

    // Bind 'this' to all functions that have in the code 'this.'
    Object.getOwnPropertyNames( Object.getPrototypeOf( this ) ).map( key => {
      if( key != 'constructor' && typeof this[key] == 'function' && this[key].toString().match(/\Wthis\./)){
        this[key] = this[key].bind(this)
      }
    })

    /*
      Insert common svg filters and icons (common.svg file).
      Notice that in FireFox, appendChild works asynchroniously, hence using Promise and delay until appendChild is complete.
    */
    let commonSVGPromise = new Promise( ( resolve , reject) => {
      let commonSvgEl = document.createElement( 'div' )
      commonSvgEl.setAttribute( 'id' , 'asvg-common-svg' )
      document.body.appendChild( commonSvgEl )
      const maxCounts = 100
      let counter = 0
      while( !document.getElementById('asvg-common-svg') && counter < maxCounts ){ setTimeout( () => counter++ , 10 ) }
      if( document.getElementById('asvg-common-svg') ){
        resolve( injectSvg( document.getElementById('asvg-common-svg') , this.defaultFileLocation + 'common.svg' , true ) )
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
        console.log( 'Display Rect' )
        console.log( displayRect )
        console.log( 'Popuplink Rect' )
        console.log( popuplinkRect )
        console.log( 'Popup Rect' )
        console.log( popupRect )

        let displayTranslate   = getTranslateAttr( display )
        let popuplinkTranslate = getTranslateAttr( popuplink )
        let popupTranslate = getTranslateAttr( popup )
        console.log( 'Display Translate' )
        console.log( displayTranslate )
        console.log( 'Popuplink Translate' )
        console.log( popuplinkTranslate )
        console.log( 'Popup Translate' )
        console.log( popupTranslate )

        let rightMargin    = displayTranslate.x + displayRect.width  - ( popuplinkTranslate.x + popupRect.width ) - 10
        let bottomMargin   = displayTranslate.y - ( popuplinkTranslate.y + popupRect.height - popuplinkRect.height + 35 )
        console.log( 'rightMargin=' + rightMargin + ' bottomMargin=' + bottomMargin )

        let alignX = popuplinkTranslate.x + ( rightMargin < 0 ? rightMargin : 0 )
        let alignY = popuplinkTranslate.y + popupRect.height - popuplinkRect.height + 25 + ( bottomMargin   < 0 ? bottomMargin : 0 )
        console.log( 'alignX=' + alignX + ' alignY=' + alignY )

        let newPtX =  popuplinkTranslate.x + popuplinkRect.x - popupRect.x
        let newPtY =  popuplinkTranslate.y + popuplinkRect.y - popupRect.y
        console.log( 'New poup translate x=' + newPtX + ' y=' + newPtY )

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
