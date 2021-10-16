import ASVG from './asvg'

if( !window.asvg ){
  window.asvg = new ASVG()
  window.addEventListener('load'  , asvg.updateAll )
  window.addEventListener('resize', asvg.updateAll )
}
