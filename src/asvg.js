import 'whatwg-fetch'
import $ from 'jquery'
import './style.css'

class ASVG{

  constructor(){

    this.displayBreakpoints = new Map([
      [ 'L', { min:1300 , max:Infinity }],
      [ 'M', { min:850  , max:1300     }],
      [ 'S', { min:350  , max:850      }],
      [ 'T', { min:0    , max:350      }]
    ])

    this.asvgParams = new WeakMap() // Map of all asvg divs

    this.config = { svgFilesFolder: '' }

    // Bind this to all methods
    Object.getOwnPropertyNames( Object.getPrototypeOf( this ) ).map( key => {
      if( key != 'constructor' && typeof this[key] == 'function' ){ this[key] = this[key].bind(this) }
    })
  }

// Event handlers
  onWindowLoad( event ){
    console.log( 'onWindowLoad event' )
    this.updateAll()
  }

  onWindowResize( event ){
    console.log( 'onWindowResize event' )
  }

  onPopupCloseClick( popupClose ){}

  onPopupLinkClick( popuplink ){}

  onSvgLinkClick( svglink ){}

// Functions
  updateAll( ){
    for(let div of $( document ).find( 'div[data-asvg]' ) ){
      this.updateParams( div )
    }
  }

  updateParams( div ){ console.log( div ) }

}

export default new ASVG()
