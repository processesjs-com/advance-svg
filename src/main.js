import ASVG from './asvg'

/*
  An instance of the ASVG class, named 'asvg', must be exposed via the window object to make onclick handlers available
*/

if( !window.asvg ){
  window.asvg = new ASVG() // Accepts a parameter object with these properties: defaultFileLocation, userErrorHandler and iconMargin
  window.addEventListener('resize', asvg.updateAll )
  // window.addEventListener('load'  , asvg.updateAll )
  window.addEventListener('asvg-ready', asvg.updateAll ) // This event shall be used insetad of 'load' event in SharePoint Webparts
}
