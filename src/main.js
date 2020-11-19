import ASVG from './asvg'

const asvg = new ASVG()

window.addEventListener('load'  , asvg.updateAll )
window.addEventListener('resize', asvg.updateAll )
