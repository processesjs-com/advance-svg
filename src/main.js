import ASVG from './asvg'

window.onPopupLinkClick  = ASVG.onPopupLinkClick
window.onPopupCloseClick = ASVG.onPopupCloseClick
window.onPageLinkClick   = ASVG.onPageLinkClick

window.addEventListener('load'  , ASVG.onWindowLoad )
window.addEventListener('resize', ASVG.onWindowResize )
