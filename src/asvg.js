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

    // Insert all common svg filters and icons
    let commonSvgEl = document.createElement( 'div' )
    // insertEl.innerHTML = svgFiltersAndIcons
    commonSvgEl.style.height   = "0px"
    commonSvgEl.style.width    = "0px"
    commonSvgEl.setAttribute( 'id' , 'asvg-common-svg' )
    document.body.appendChild( commonSvgEl )
    injectSvg( document.getElementById('asvg-common-svg') , this.defaultFileLocation + 'common.svg' )
    .then( () => { console.log('Common SVG inserted.') } )
    .catch( err => this.catchError( err ) )
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
          let fileLocation = element.getAttribute( 'data-asvg-filelocation' ) ? element.getAttribute( 'data-asvg-filelocation' ) : this.defaultFileLocation
          injectSvg( element , fileLocation + element.getAttribute( 'data-asvg-show' ) )
          .then( () => {
            params.injected = element.getAttribute( 'data-asvg-show' )
            params.currentDisplay = null
          })
          // 1.1. Add icons
          .then( () => {
            this.addIcons( element , 'data-asvg-icon-close'     , '" href="#asvg-icon-close" class="asvg-icon-close" onclick="asvg.onPopupCloseClick(this)" />' )
            this.addIcons( element , 'data-asvg-icon-popuplink' , '" href="#asvg-icon-popuplink" />' )
            this.addIcons( element , 'data-asvg-icon-pagelink'  , '" href="#asvg-icon-pagelink" />'  )
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

      addIcons( element , dataAttr , addString ){
        const flatStr = str => str.toLowerCase().replace( /[\s-_]+/g,'' )

        for(let targetElement of element.querySelectorAll( '[' + dataAttr + ']' ) ){
          let BBox = targetElement.getBBox()
          const x={ l: BBox.x + 2 , c: BBox.x + BBox.width/2 - 10  , r: BBox.x + BBox.width - 20  }
          const y={ t: BBox.y + 2 , m: BBox.y + BBox.height/2 - 10 , b: BBox.y + BBox.height - 20 }
          let position = { x: x.l , y: y.t } // Top Left by default
          switch( flatStr( targetElement.getAttribute( dataAttr ) ) ){
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
}

export default ASVG
