/**
 * @module ol/render/canvas
 */
import {getFontFamilies} from '../css.js';
import {createCanvasContext2D} from '../dom.js';
import {clear} from '../obj.js';
import LRUCache from '../structs/LRUCache.js';
import {create as createTransform} from '../transform.js';


/**
 * @const
 * @type {string}
 */
export const defaultFont = '10px sans-serif';


/**
 * @const
 * @type {ol.Color}
 */
export const defaultFillStyle = [0, 0, 0, 1];


/**
 * @const
 * @type {string}
 */
export const defaultLineCap = 'round';


/**
 * @const
 * @type {Array.<number>}
 */
export const defaultLineDash = [];


/**
 * @const
 * @type {number}
 */
export const defaultLineDashOffset = 0;


/**
 * @const
 * @type {string}
 */
export const defaultLineJoin = 'round';


/**
 * @const
 * @type {number}
 */
export const defaultMiterLimit = 10;


/**
 * @const
 * @type {ol.Color}
 */
export const defaultStrokeStyle = [0, 0, 0, 1];


/**
 * @const
 * @type {string}
 */
export const defaultTextAlign = 'center';


/**
 * @const
 * @type {string}
 */
export const defaultTextBaseline = 'middle';


/**
 * @const
 * @type {Array.<number>}
 */
export const defaultPadding = [0, 0, 0, 0];


/**
 * @const
 * @type {number}
 */
export const defaultLineWidth = 1;


/**
 * The label cache for text rendering. To change the default cache size of 2048
 * entries, use {@link ol.structs.LRUCache#setSize}.
 * @type {ol.structs.LRUCache.<HTMLCanvasElement>}
 * @api
 */
export const labelCache = new LRUCache();


/**
 * @type {!Object.<string, number>}
 */
export const checkedFonts = {};


/**
 * @type {CanvasRenderingContext2D}
 */
let measureContext = null;


/**
 * @type {!Object.<string, number>}
 */
export const textHeights = {};


/**
 * Clears the label cache when a font becomes available.
 * @param {string} fontSpec CSS font spec.
 */
export const checkFont = (function() {
  const retries = 60;
  const checked = checkedFonts;
  const size = '32px ';
  const referenceFonts = ['monospace', 'serif'];
  const len = referenceFonts.length;
  const text = 'wmytzilWMYTZIL@#/&?$%10\uF013';
  let interval, referenceWidth;

  function isAvailable(font) {
    const context = getMeasureContext();
    let available = true;
    for (let i = 0; i < len; ++i) {
      const referenceFont = referenceFonts[i];
      context.font = size + referenceFont;
      referenceWidth = context.measureText(text).width;
      if (font != referenceFont) {
        context.font = size + font + ',' + referenceFont;
        const width = context.measureText(text).width;
        // If width and referenceWidth are the same, then the fallback was used
        // instead of the font we wanted, so the font is not available.
        available = available && width != referenceWidth;
      }
    }
    return available;
  }

  function check() {
    let done = true;
    for (const font in checked) {
      if (checked[font] < retries) {
        if (isAvailable(font)) {
          checked[font] = retries;
          clear(textHeights);
          // Make sure that loaded fonts are picked up by Safari
          measureContext = null;
          labelCache.clear();
        } else {
          ++checked[font];
          done = false;
        }
      }
    }
    if (done) {
      clearInterval(interval);
      interval = undefined;
    }
  }

  return function(fontSpec) {
    const fontFamilies = getFontFamilies(fontSpec);
    if (!fontFamilies) {
      return;
    }
    for (let i = 0, ii = fontFamilies.length; i < ii; ++i) {
      const fontFamily = fontFamilies[i];
      if (!(fontFamily in checked)) {
        checked[fontFamily] = retries;
        if (!isAvailable(fontFamily)) {
          checked[fontFamily] = 0;
          if (interval === undefined) {
            interval = setInterval(check, 32);
          }
        }
      }
    }
  };
})();


/**
 * @return {CanvasRenderingContext2D} Measure context.
 */
function getMeasureContext() {
  if (!measureContext) {
    measureContext = createCanvasContext2D(1, 1);
  }
  return measureContext;
}


/**
 * @param {string} font Font to use for measuring.
 * @return {ol.Size} Measurement.
 */
export const measureTextHeight = (function() {
  let span;
  const heights = textHeights;
  return function(font) {
    let height = heights[font];
    if (height == undefined) {
      if (!span) {
        span = document.createElement('span');
        span.textContent = 'M';
        span.style.margin = span.style.padding = '0 !important';
        span.style.position = 'absolute !important';
        span.style.left = '-99999px !important';
      }
      span.style.font = font;
      document.body.appendChild(span);
      height = heights[font] = span.offsetHeight;
      document.body.removeChild(span);
    }
    return height;
  };
})();


/**
 * @param {string} font Font.
 * @param {string} text Text.
 * @return {number} Width.
 */
export function measureTextWidth(font, text) {
  const measureContext = getMeasureContext();
  if (font != measureContext.font) {
    measureContext.font = font;
  }
  return measureContext.measureText(text).width;
}


/**
 * @param {CanvasRenderingContext2D} context Context.
 * @param {number} rotation Rotation.
 * @param {number} offsetX X offset.
 * @param {number} offsetY Y offset.
 */
export function rotateAtOffset(context, rotation, offsetX, offsetY) {
  if (rotation !== 0) {
    context.translate(offsetX, offsetY);
    context.rotate(rotation);
    context.translate(-offsetX, -offsetY);
  }
}


export const resetTransform = createTransform();


/**
 * @param {CanvasRenderingContext2D} context Context.
 * @param {ol.Transform|null} transform Transform.
 * @param {number} opacity Opacity.
 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image Image.
 * @param {number} originX Origin X.
 * @param {number} originY Origin Y.
 * @param {number} w Width.
 * @param {number} h Height.
 * @param {number} x X.
 * @param {number} y Y.
 * @param {number} scale Scale.
 */
export function drawImage(context,
  transform, opacity, image, originX, originY, w, h, x, y, scale) {
  let alpha;
  if (opacity != 1) {
    alpha = context.globalAlpha;
    context.globalAlpha = alpha * opacity;
  }
  if (transform) {
    context.setTransform.apply(context, transform);
  }

  context.drawImage(image, originX, originY, w, h, x, y, w * scale, h * scale);

  if (alpha) {
    context.globalAlpha = alpha;
  }
  if (transform) {
    context.setTransform.apply(context, resetTransform);
  }
}
