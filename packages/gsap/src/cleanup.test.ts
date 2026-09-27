// @vitest-environment happy-dom
import { gsap } from 'gsap';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Motly } from './index.js';
import { button, overlay, overlays, spec } from './testing/dom.js';

beforeAll(() => {
  gsap.registerPlugin(Motly);
});

afterEach(() => {
  document.body.replaceChildren();
});

/** A paused timeline holding one burst, scrubbed mid-flight. */
function midFlight() {
  const tl = gsap.timeline({ paused: true });
  tl.burst(button(100, 50), { spec }, 0);
  tl.progress(0.5);
  return tl;
}

describe('cleanup mid-flight', () => {
  it('clears the burst on tween.kill()', () => {
    const tween = gsap.effects.burst(button(100, 50), { spec, paused: true });
    tween.progress(0.5);

    tween.kill();

    expect(overlay()).toBeNull();
  });

  it('clears the burst on tween.revert()', () => {
    const tween = gsap.effects.burst(button(100, 50), { spec, paused: true });
    tween.progress(0.5);

    tween.revert();

    expect(overlay()).toBeNull();
  });

  it('clears the burst on tl.revert()', () => {
    const tl = midFlight();
    expect(overlay()).not.toBeNull();

    tl.revert();

    expect(overlay()).toBeNull();
  });

  it('clears every burst made in a context on its revert(), as useGSAP does on unmount', () => {
    const ctx = gsap.context(() => {
      gsap.effects.burst(button(100, 50), { spec, paused: true }).progress(0.5);
      midFlight();
    });
    expect(overlays()).toHaveLength(2);

    ctx.revert();

    expect(overlay()).toBeNull();
  });

  it('leaves the burst drawn on tl.kill(), which reaches nothing on its children (documented)', () => {
    const tl = midFlight();
    expect(overlay()).not.toBeNull();

    tl.kill();

    expect(overlay()).not.toBeNull();
  });

  it('still calls the onInterrupt it is given, with its scope and params, after the clear', () => {
    const scope = {};
    const seen: unknown[] = [];
    const tween = gsap.effects.burst(button(100, 50), {
      spec,
      paused: true,
      callbackScope: scope,
      onInterruptParams: ['why'],
      onInterrupt(this: unknown, reason: string) {
        seen.push(this, reason, overlay());
      },
    });
    tween.progress(0.5);

    tween.kill();

    expect(seen).toEqual([scope, 'why', null]);
  });

  it('calls an onInterrupt set with gsap.defaults(), as on any tween', () => {
    const calls: string[] = [];
    gsap.defaults({ onInterrupt: () => calls.push('default') });
    try {
      const tween = gsap.effects.burst(button(100, 50), { spec, paused: true });
      tween.progress(0.5);

      tween.kill();
    } finally {
      delete gsap.defaults().onInterrupt;
    }

    expect(calls).toEqual(['default']);
    expect(overlay()).toBeNull();
  });
});

describe('cleanup at the end', () => {
  it('leaves no overlay behind a burst fired many times and run to its end', () => {
    const anchor = button(100, 50);

    for (let i = 0; i < 20; i++) {
      gsap.effects.burst(anchor, { spec, paused: true }).progress(0.5).progress(1);
    }

    expect(overlays()).toHaveLength(0);
  });
});
