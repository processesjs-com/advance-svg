import ASVG from './asvg'

window.onPopupLinkClick  = ASVG.onPopupLinkClick
window.onPopupCloseClick = ASVG.onPopupCloseClick
window.onSvgLinkClick    = ASVG.onSvgLinkClick

window.addEventListener('load'  , ASVG.onWindowLoad )
window.addEventListener('resize', ASVG.onWindowResize )
