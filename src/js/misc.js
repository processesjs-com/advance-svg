export const getTranslateAttr = el => {
  let result={ x:0 , y:0 }
  let transform = el.getAttribute('transform')
  if( transform ){
    let translate = transform.match(/translate\(([\d\.\-]*)[\s|,]([\d\.\-]*)\)/i)
    if( translate && translate.length>2 ){ result={ x:1*translate[1] , y:1*translate[2]  } }
  }
  return result
}

export const setTranslateAttr = ( el , newTranslate ) => {
  let transform = el.getAttribute('transform')
  if( transform ){
    let translate = transform.match(/translate\(([\d\.\-]*)[\s|,]([\d\.\-]*)\)/i)
    if( translate && translate.length>2){
      transform = transform.replace(translate[0],'translate(' + newTranslate.x + ',' + newTranslate.y + ')')
    }else{
      transform = transform + ' translate(' + newTranslate.x + ',' + newTranslate.y + ')'
    }
  }else{
    transform = 'translate(' + newTranslate.x + ',' + newTranslate.y + ')'
  }
  el.setAttribute( 'transform' , transform )
}

export const getFirst = obj => { return ( obj && obj.length && obj.length>0 ? obj[0] : null ) }
