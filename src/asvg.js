import 'whatwg-fetch'
import cheerio from 'cheerio'
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

    let serializer = new XMLSerializer()
    this.c$ = cheerio.load( serializer.serializeToString( document ) )

    // Bind this to all methods
    Object.getOwnPropertyNames( Object.getPrototypeOf( this ) ).map( key => {
      if( key != 'constructor' && typeof this[key] == 'function' ){ this[key] = this[key].bind(this) }
    })
  }

// Event handlers
  onWindowLoad( event ){
    this.updateAll()
  }

  onWindowResize( event ){

  }

  onPopupCloseClick( popupClose ){}

  onPopupLinkClick( popuplink ){}

  onSvgLinkClick( svglink ){}

// Functions
  updateAll( ){
    for(let div of this.c$( 'div[data-asvg]' ) ){
      this.updateParams( div )
    }
  }

  updateParams( div ){ console.log( div ) }

}

export default new ASVG()
