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
    this.config = { svgFilesFolder: './' }
    // Bind 'this' to all methods except the constructor
    Object.getOwnPropertyNames( Object.getPrototypeOf( this ) ).map( key => {
      if( key != 'constructor' && typeof this[key] == 'function' ){ this[key] = this[key].bind(this) }
    })
  }

// Event handlers
  onWindowLoad( event ){ this.updateAll() }
  onWindowResize( event ){ }

  onPopupCloseClick( element ){}
  onPopupLinkClick( element ){}
  onSvgLinkClick( element ){}

// Functions
  updateAll( ){
    for(let div of $( 'div[data-asvg]' ) ){ this.updateParams( div ) }
  }

  updateParams( div ){
    if( !this.asvgParams.has( div ) ){
      this.asvgParams.set( div , {
        root: $( div ).data( 'asvg' ) ,injected:null, currentDisplay:null, targetDisplay:null
      })
    }
    let svg = this.asvgParams.get( div )
    for(let [ label , size ] of this.displayBreakpoints.entries()){
      if( div.offsetWidth >= size.min && div.offsetWidth < size.max ){
        if( svg.targetDisplay != label ){ svg.targetDisplay = label }
        break
      }
    }
    console.log( svg )
  }

}

export default new ASVG()
