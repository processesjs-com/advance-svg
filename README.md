# advance-svg

JavaScript library for advancing SVG graphics with:
* responsive behaviour and
* popup shapes

The responsive behaiour allows fitting a graphic to pre-defined rectangular boundries, depending on the container's width.
The graphics shall define four rectangular boudries: Thumbnail, Small, Medium and Large.

The popup shapes are outside all boundries. When clicking on a popuplink shape the corresponding popup shape moves and displays underneath.

Five types of shapes can be set in the graphic:
* displayX  - define boundaries to fit various screen sizes: Thumb, Small, Medium and Large
* popup     - shapes that are outside of the displays and move under a popuplink when clicked
* popuplink - shapes that link to a pupup
* svglink   - link to another graphic which will replace the current within the same container
* link      - link to another page on the browser

The library can be used from CDN or as NPM module.
