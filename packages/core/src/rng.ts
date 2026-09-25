/**
 * The seeded RNG: stateless 32-bit hashing, so a value depends only on the Seed and the key it is
 * derived with, never on how many values were drawn before it. Never calls `Math.random`.
 */

/** A bijective 32-bit integer mixer (Chris Wellons' `lowbias32`). */
function mix(value: number): number {
  let h = value >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}

/** The Seed for `key` under `seed`. Distinct keys under one Seed give distinct Seeds. */
export function derive(seed: number, key: number): number {
  return mix(mix(seed) ^ key);
}

/** A 32-bit key for a name, by FNV-1a. */
export function keyOf(name: string): number {
  let h = 0x811c9dc5;
  for (let index = 0; index < name.length; index++) {
    h = Math.imul(h ^ name.charCodeAt(index), 0x01000193);
  }
  return h >>> 0;
}

/** A number in [0, 1) determined by `seed` alone. */
export function unit(seed: number): number {
  return mix(seed) / 2 ** 32;
}
