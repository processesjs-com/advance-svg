# advance-svg

JavaScript library for advancing SVG graphics with:
* responsive behaviour
* popup shapes
* in-page links

The responsive behaiour allows fitting a graphic to pre-defined rectangular boundries (scenes), depending on the container's (div tag) width.
The graphics shall define four rectangular boudries, from smalles to larges: Thumbnail, Small, Medium and Large.

The popup shapes are hidden from the scenes. When clicking on a popuplink the corresponding popup shape pops over.

Five types of shapes can be set in the graphic:
* displayX  - define boundaries (scenes) to fit various screen sizes: Thumb, Small, Medium and Large
* popup     - shapes that are hidden and show over a popuplink when clicked
* popuplink - shapes that link to a pupup
* pagelink  - in-page link to another graphic which will replace the current one within the same container
* hyperlink - link to another page in the browser

The library can be used from CDN or as NPM module.

## Demo and CDN repository

https://d2a8hhqmsel69m.cloudfront.net/

NPM installation command:
```
npm install advance-svg
```

Snippet for useing the library
```
import ASVG from 'advance-svg'

const asvg = new ASVG( )

window.addEventListener('load'  , asvg.updateAll )
window.addEventListener('resize', asvg.updateAll )
```

## Properties

The Constructor accepts a properties object. However, currently only one parameter is implemented for custom error handling function when page-not-found error occurs.
By default the library will display the browser's Alert message. To implement custom function, can use the snippet below:

```
import ASVG from 'advance-svg'

const customPageNotFoundFunction = err => {
  ... // Custome code
}

const asvg = new ASVG( {
  userErrorHandler = customPageNotFoundFunction
} )

window.addEventListener('load'  , asvg.updateAll )
window.addEventListener('resize', asvg.updateAll )

```
