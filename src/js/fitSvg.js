import { getTranslateAttr } from './misc'

const fitSvg = ( element , targetDisplay ) => {
  return new Promise( ( resolve , reject ) => {

    let svg = element.querySelector('svg')
    if( svg ){
      let display = svg.querySelector('[data-asvg-display="' + targetDisplay + '"]')
      if( display ){
        let viewBox = display.getBBox()
        let translate = getTranslateAttr( display )
        viewBox.x += translate.x
        viewBox.y += translate.y
      }else{ reject( new Error('Could not find display group.') ) ; return }
      svg.setAttribute( 'viewBox' , ''+ viewBox.x +' '+ viewBox.y +' '+ viewBox.width +' '+ viewBox.height )
      svg.setAttribute( 'width'   , ''+ element.offsetWidth +'px' )
      svg.setAttribute( 'height'  , ''+ viewBox.height * element.offsetWidth / viewBox.width +'px' )
      resolve ()
    }else{ reject( new Error('Could not find SVG object.') ) }
  } )
}

export default fitSvg
