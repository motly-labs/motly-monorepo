import { gsap } from 'gsap';
import { describe, expect, it } from 'vitest';
import { Motly } from './index.js';

describe('registration', () => {
  it('registers nothing on import, and burst and tl.burst on registerPlugin, in Node', () => {
    expect(gsap.effects.burst).toBeUndefined();

    gsap.registerPlugin(Motly);

    expect(gsap.effects.burst).toBeTypeOf('function');
    expect(gsap.timeline().burst).toBeTypeOf('function');
  });
});
