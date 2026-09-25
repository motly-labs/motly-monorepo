import { describe, expect, it } from 'vitest';
import { createScope, type InstanceBinding, type Renderer } from './index.js';

const renderer: Renderer = { draw() {}, release() {} };
const binding: InstanceBinding = { renderer, origin: { x: 0, y: 0 }, seed: 1 };

/** Build an Instance from `spec` as if it came from JSON, where the types cannot help. */
const create = (spec: unknown) => () => createScope().burst(spec as never, binding);
const circle = (fields: object) => create({ kind: 'circle', ...fields });
const rand = (min: unknown, max: unknown) => ({ __motly: 'rand', min, max });
const each = (...values: unknown[]) => ({ __motly: 'each', values });

describe('a JSON Spec is validated in full when the Instance is created', () => {
  it.each([
    ['not an object', null, /Spec.*null/],
    ['an unknown kind', { kind: 'square' }, /kind.*'square'.*circle, burst/],
    ['a misspelt field', { kind: 'circle', raduis: 5 }, /raduis.*circle/],
    ['a Burst with no Child', { kind: 'burst' }, /children.*missing/],
    [
      'a fractional count',
      { kind: 'burst', count: 2.5, children: { kind: 'circle' } },
      /count.*2\.5/,
    ],
    ['a negative count', { kind: 'burst', count: -1, children: { kind: 'circle' } }, /count/],
    [
      'a misspelt field in a Child',
      { kind: 'burst', children: { kind: 'circle', raduis: 5 } },
      /children\.raduis/,
    ],
    [
      'a bad Child of a Burst with no Children',
      { kind: 'burst', count: 0, children: { kind: 'circle', radius: '2em' } },
      /children\.radius.*'2em'/,
    ],
  ])('rejects %s', (_label, spec, error) => {
    expect(create(spec)).toThrow(error);
  });

  it.each([
    ['null', { radius: null }, /radius.*null/],
    ['a boolean', { radius: true }, /radius.*true/],
    ['empty Keyframes', { radius: [] }, /radius.*\[\]/],
    ['nested Keyframes', { radius: [0, [1, 2]] }, /radius\[1\]/],
    ['a bad Keyframe', { opacity: [0, null] }, /opacity\[1\].*null/],
    ['delta syntax', { radius: { 0: 50 } }, /radius.*Keyframes are an array/],
    ['a rand() without numbers', { radius: rand('a', 1) }, /radius.*rand/],
    ['an unknown Descriptor', { radius: { __motly: 'nope' } }, /radius/],
    ['an empty each()', { radius: each() }, /radius.*each/],
    ['a nested each()', { radius: each(each(1)) }, /radius\.each\[0\]/],
    ['an each() value no Child picks', { radius: each(1, 'bad') }, /radius\.each\[1\].*'bad'/],
  ])('rejects a number property that is %s', (_label, fields, error) => {
    expect(circle(fields)).toThrow(error);
  });

  it.each([
    ['Keyframes', { duration: [1, 2] }, /duration/],
    ['negative', { duration: -1 }, /duration.*-1/],
    ['negative in ms', { duration: '-5ms' }, /duration.*'-5ms'/],
    ['a rand() that can be negative', { duration: rand(-1, 1) }, /duration/],
  ])('rejects a duration that is %s', (_label, fields, error) => {
    expect(circle(fields)).toThrow(error);
  });

  it.each([
    ['not a color', { fill: 'notacolor' }, /fill.*'notacolor'/],
    ['a number', { stroke: 5 }, /stroke.*5/],
    ['currentColor as a Keyframe', { fill: ['currentColor', 'red'] }, /fill\[0\].*'currentColor'/],
  ])('rejects a color that is %s', (_label, fields, error) => {
    expect(circle(fields)).toThrow(error);
  });

  it('accepts any CSS color as a constant, even one it cannot animate', () => {
    for (const fill of ['none', 'currentColor', 'hsl(10 20% 30%)', 'oklch(0.7 0.1 200)', '#abc']) {
      expect(circle({ fill })).not.toThrow();
    }
  });

  it.each([
    ['null', { easing: null }, /easing.*null/],
    ['keyed by a property the Element lacks', { easing: { points: 'ease' } }, /easing\.points/],
    [
      'an each() value no Child picks',
      { easing: each('ease', 'bogus') },
      /easing\.each\[1\].*'bogus'/,
    ],
  ])('rejects an easing that is %s', (_label, fields, error) => {
    expect(circle(fields)).toThrow(error);
  });

  it('rejects a Burst easing keyed by anything but its own radius', () => {
    const spec = { kind: 'burst', easing: { opacity: 'ease' }, children: { kind: 'circle' } };

    expect(create(spec)).toThrow(/easing\.opacity/);
  });

  it('accepts everything the types allow', () => {
    const spec = {
      kind: 'burst',
      count: 0,
      radius: [0, '40px', rand(1, 2)],
      easing: each({ default: 'ease', radius: [0.4, 0, 0.2, 1] }, 'linear'),
      children: {
        kind: 'circle',
        duration: each('600ms', rand(0.5, 1), 2),
        radius: each([1, 2], rand(0, 1)),
        angle: [0, '0.5turn', '1rad'],
        fill: each(['red', '#0000ff80'], 'currentColor'),
        easing: { opacity: 'ease-in' },
      },
    };

    expect(create(JSON.parse(JSON.stringify(spec)))).not.toThrow();
  });
});
