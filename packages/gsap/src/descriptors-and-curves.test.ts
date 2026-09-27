import * as core from '@motly/core';
import { describe, expect, it } from 'vitest';
import * as gsapEntry from './index.js';

// Every value core exports for writing a Spec: the Descriptors and the named curves.
const descriptorsAndCurves = Object.entries(core).filter(
  ([name]) => name === 'rand' || name === 'each' || /(In|Out|InOut)$/.test(name),
);
const exported = new Map(Object.entries(gsapEntry));

describe('Descriptors and curves', () => {
  it('covers rand, each and every named curve', () => {
    const names = descriptorsAndCurves.map(([name]) => name);
    expect(names).toEqual(expect.arrayContaining(['rand', 'each', 'backOut', 'sineInOut']));
    expect(names).toHaveLength(32);
  });

  it.each(descriptorsAndCurves)('re-exports %s from core', (name, value) => {
    expect(exported.get(name)).toBe(value);
  });
});
