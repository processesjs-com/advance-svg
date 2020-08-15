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

    Object.getOwnPropertyNames( Object.getPrototypeOf( this ) ).map( key => {
      console.log( key + ' typeof ' + typeof this[key] )
    })
  }

// Event handlers
  onWindowLoad( event ){
    console.log( 'onWindowLoad event' )
  }

  onWindowResize( event ){
    console.log( 'onWindowResize event' )
  }

  onPopupCloseClick( popupClose ){}

  onPopupLinkClick( popuplink ){}

  onSvgLinkClick( svglink ){}

// Functions
  updateParams( div ){ console.log( div ) }

  updateAll( ){
    for(let div of $( document ).find( 'div[data-asvg]' ) ){
      this.updateParams( div )
    }
  }

}

export default new ASVG()
