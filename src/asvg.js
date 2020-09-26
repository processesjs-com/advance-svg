import 'whatwg-fetch'
import $ from 'jquery'
import './style.css'
import injectSvg from './js/injectSvg'
import fitSvg from './js/fitSvg'

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

    // Bind 'this' to all methods that need it
    Object.getOwnPropertyNames( Object.getPrototypeOf( this ) ).map( key => {
      if( key != 'constructor' && typeof this[key] == 'function' && this[key].toString().match(/this./)){
        this[key] = this[key].bind(this)
      }
    })
  }
// Event handlers
  onWindowLoad( event ){ this.injectSvgFilters(); this.updateAll() }
  onWindowResize( event ){ this.updateAll() }

  onPopupCloseClick( element ){}
  onPopupLinkClick( element ){}
  onSvgLinkClick( element ){}

// Functions
  updateAll( ){
    for(let div of $( 'div[data-asvg]' ) ){
      let params = this.updateParams( div )
    //Inject SVG file if needed
      new Promise( ( resolve , reject ) => {
        if( !params.injected || params.injected != $( div ).data( 'asvg-show' ) ){
          injectSvg( div , this.config.svgFilesFolder + $( div ).data( 'asvg-show' ) + '.svg' )
          .then( () => {
            params.injected = $( div ).data( 'asvg-show' )
            params.currentDisplay = null
            resolve()
          })
          .catch( err => reject( err ) )
        }else{ resolve() }
      } )
    //Fit to display if needed
      .then( () => {
        if( params.currentDisplay != params.targetDisplay ){
          fitSvg()
          .then( () => { params.currentDisplay = params.targetDisplay } )
          .catch( err => reject( err ) )
        }
      })
      .catch( err => this.catchError( err ) )
    }
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
  }

  catchError( err ){ console.log( err ) }
}

export default new ASVG()
