/**
 * @module ol/types
 */


/**
 * An array of numbers representing an xy coordinate. Example: `[16, 48]`.
 * @typedef {Array.<number>} Coordinate
 * @api
 */

/**
 * Key to use with {@link module:ol/Observable~Observable#unByKey}.
 * @typedef {Object} EventsKey
 * @property {Object} [bindTo]
 * @property {ol.EventsListenerFunctionType} [boundListener]
 * @property {boolean} callOnce
 * @property {number} [deleteIndex]
 * @property {ol.EventsListenerFunctionType} listener
 * @property {EventTarget|ol.events.EventTarget} target
 * @property {string} type
 */

/**
 * An array of numbers representing an extent: `[minx, miny, maxx, maxy]`.
 * @typedef {Array.<number>} Extent
 * @api
 */

/**
 * An array with two elements, representing a pixel. The first element is the
 * x-coordinate, the second the y-coordinate of the pixel.
 * @typedef {Array.<number>} Pixel
 * @api
 */

/**
 * @typedef {function(module:ol/PluggableMap~PluggableMap, ?olx.FrameState): boolean} PostRenderFunction
 */

/**
 * A projection as {@link module:ol/proj/Projection~Projection}, SRS identifier
 * string or undefined.
 * @typedef {module:ol/proj/Projection~Projection|string|undefined} ProjectionLike
 * @api
 */

/**
 * An array of numbers representing a size: `[width, height]`.
 * @typedef {Array.<number>} Size
 * @api
 */

/**
 * An array representing an affine 2d transformation for use with
 * {@link module:ol/transform} functions. The array has 6 elements.
 * @typedef {!Array.<number>} Transform
 */

/**
 * A transform function accepts an array of input coordinate values, an optional
 * output array, and an optional dimension (default should be 2).  The function
 * transforms the input coordinate values, populates the output array, and
 * returns the output array.
 *
 * @typedef {function(Array.<number>, Array.<number>=, number=): Array.<number>} TransformFunction
 * @api
 */
