import asvg from './index'

window.handlePopupLinkClick  = asvg.handlePopupLinkClick
window.handlePopupCloseClick = asvg.handlePopupCloseClick
window.handleSvgLinkClick    = asvg.handleSvgLinkClick

window.addEventListener('load'  , asvg.handleWindowLoad )
window.addEventListener('resize', asvg.handleWindowResize )
