import ASVG from './asvg'

window.addEventListener('load'  , ASVG.onWindowLoad )
window.addEventListener('resize', ASVG.onWindowResize )

window.onPopupLinkClick  = ASVG.onPopupLinkClick
window.onPopupCloseClick = ASVG.onPopupCloseClick
window.onPageLinkClick   = ASVG.onPageLinkClick
