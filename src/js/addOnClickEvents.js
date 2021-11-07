import Cheerio from 'cheerio'

const addOnClickEvents = ( origSvg ) =>{
  return new Promise( ( resolve , reject ) => {
    let svgStr = origSvg.slice(0) // Clone the origSvg string

    /* Create document object */
    const $ = Cheerio.load( svgStr , { ignoreWhitespace: true , xmlMode: true } )

    $( '[data-asvg-popuplink]' ).attr( 'onclick' , 'asvg.onPopupLinkClick(this)' )
    $( '[data-asvg-pagelink]'  ).attr( 'onclick' , 'asvg.onPageLinkClick(this)'  )

    // Convert document object to text
    svgStr = $.xml()

    resolve( svgStr )
  } )
}

export default addOnClickEvents