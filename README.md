# advance-svg

JavaScript library for advancing SVG graphics with:
* responsive behaviour and
* popup shapes

The responsive behaiour allows fitting to pre-defined display boundries on the graphic.
The graphics shall define four rectangular areas (display boudries): Thumbnail, Small, Medium and Large.

The popup shapes stay outside all display boundries. They are called by clicking popuplink shapes and they display underneath.

Five types of shapes shall can be set in the graphic:
* displayX  - define boundaries to fit various screen sizes: Thumb, Small, Medium and Large
* popup     - shapes that are outside of the displays and move under a popuplink when clicked
* popuplink - shapes that link to pupups
* svglink   - link to another graphic which will replace the current within the same container
* link      - link to another page on the browser

The library can be used from CDN or as NPM module.
