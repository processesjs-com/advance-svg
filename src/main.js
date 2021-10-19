import ASVG from './asvg'

/*
  An instance of the ASVG class, named 'asvg', must be exposed via window object to make onclick handlers available
*/

if( !window.asvg ){
  window.asvg = new ASVG()
  window.addEventListener('load'  , asvg.updateAll )
  window.addEventListener('resize', asvg.updateAll )
}
