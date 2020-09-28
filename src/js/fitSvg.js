import $ from 'jquery'
import { getFirst , getTranslateAttr } from './misc'

const fitSvg = ( div , targetDisplay ) => {
  return new Promise( ( resolve , reject ) => {

    let svg = getFirst( $( div ).find('svg') )
    if( svg ){
      let viewBox = { x:0 , y:0 , w:100 , h:100 }
      let display = getFirst( $( svg ).find('[data-asvg-display="' + targetDisplay + '"]') )
      if( display ){
        let translate = getTranslateAttr( display )
        let rect = getFirst( $( display ).find('rect') )
        if( rect ){
          viewBox = {
            x:Math.round( 1*rect.getAttribute('x') + translate.x ),
            y:Math.round( 1*rect.getAttribute('y') + translate.y ),
            w:Math.round( 1*rect.getAttribute('width')),
            h:Math.round( 1*rect.getAttribute('height'))
          }
        }else{ reject( new Error('Could not find rect shape.') ) ; return }
      }else{ reject( new Error('Could not find display group.') ) ; return }
      svg.setAttribute( 'viewBox' , ''+ viewBox.x +' '+ viewBox.y +' '+ viewBox.w +' '+ viewBox.h )
      svg.setAttribute( 'width'   , ''+ div.offsetWidth +'px' )
      svg.setAttribute( 'height'  , ''+ viewBox.h * div.offsetWidth / viewBox.w +'px' )

      resolve ()
    }else{ reject( new Error('Could not find SVG object.') ) }
  } )
}

export default fitSvg