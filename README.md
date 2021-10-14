# advance-svg

JavaScript library for advancing SVG graphics with:
* responsive behaviour
* popup shapes
* in-page links

The responsive behaiour allows fitting a graphic to pre-defined rectangular boundries (Display shapes), in response to the container's (div tag) size (width).
The graphics shall define four Display shapes, from smallest to largest: Thumbnail, Small, Medium and Large.

The popup shapes are hidden from the scene. When a popuplink is selected (tap/click), the corresponding popup shape shows over the popuplink.

There are six parameters that can modify any shape (group tag) in the graphic:
* display    - define boundaries (scenes) i.e.: Thumbnail, Small, Medium and Large
* popup      - shapes that are hidden and show over popuplinks
* popuplink  - shapes that link to a pupups
* pagelink   - in-page link to another graphic that will replace the current graphic within the same container
* hreftarget - modifies the target of anchor tags
* icon       - icon that can be added to shapes

The library can be used from CDN or from NPM module.

## Demo and CDN repository

https://d2a8hhqmsel69m.cloudfront.net/

NPM installation command:
```
npm install advance-svg
```

Snippet for useing the library (see main.js in the source code)
```
import ASVG from 'advance-svg'

const asvg = new ASVG( )

window.addEventListener('load'  , asvg.updateAll )
window.addEventListener('resize', asvg.updateAll )
```

## Properties

The Constructor accepts a properties object. However, currently only one parameter is implemented for custom error handling function when page-not-found error occurs.
By default the library will display the browser's Alert message. To implement custom function, can use this snippet:

```
import ASVG from 'advance-svg'

const customPageNotFoundFunction = err => {
  ... // Custom code
}

const asvg = new ASVG( {
  userErrorHandler : customPageNotFoundFunction
} )

window.addEventListener('load'  , asvg.updateAll )
window.addEventListener('resize', asvg.updateAll )

```
