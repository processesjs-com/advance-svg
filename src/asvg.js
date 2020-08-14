import 'whatwg-fetch'
import './style.css'

class ASVG{

  constructor(){

    this.displayBreakpoints = new Map([
      [ 'L', { min:1300 , max:Infinity }],
      [ 'M', { min:850  , max:1300     }],
      [ 'S', { min:350  , max:850      }],
      [ 'T', { min:0    , max:350      }]
    ])

    this.asvgParams = new WeakMap() // Map of all asvg divs - to be populated by searchAllASVG

  }

  onWindowLoad( event ){
    console.log('onWindowLoad event')
  }

  onWindowResize( event ){
    console.log('onWindowResize event')
  }

  onPopupCloseClick( popupClose ){}

  onPopupLinkClick( popuplink ){}

  onSvgLinkClick( svglink ){}

}

export default new ASVG()
