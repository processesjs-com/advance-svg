import ASVG from './asvg'

const window.asvg = new ASVG()

window.addEventListener('load'  , asvg.updateAll )
window.addEventListener('resize', asvg.updateAll )
