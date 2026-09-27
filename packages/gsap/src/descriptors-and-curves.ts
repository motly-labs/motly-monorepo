/**
 * What a Spec is written with, re-exported from core so one import is enough: the Descriptors
 * `rand` and `each`, and the named curves. The script build's `Motly` carries them too, as
 * `Motly.rand`, for a page with no imports; the plugin itself does not, so unused ones tree-shake.
 */

export {
  backIn,
  backInOut,
  backOut,
  bounceIn,
  bounceInOut,
  bounceOut,
  circIn,
  circInOut,
  circOut,
  cubicIn,
  cubicInOut,
  cubicOut,
  each,
  elasticIn,
  elasticInOut,
  elasticOut,
  expoIn,
  expoInOut,
  expoOut,
  quadIn,
  quadInOut,
  quadOut,
  quartIn,
  quartInOut,
  quartOut,
  quintIn,
  quintInOut,
  quintOut,
  rand,
  sineIn,
  sineInOut,
  sineOut,
} from '@motly/core';
