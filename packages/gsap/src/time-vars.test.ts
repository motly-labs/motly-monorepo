// @vitest-environment happy-dom
import { type BurstSpec, rand } from '@motly/core';
import { gsap } from 'gsap';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Motly } from './index.js';
import { button, oracle, overlay, place, spec } from './testing/dom.js';

// The centre of every `button(100, 50)` below.
const origin = { x: 120, y: 60 };

beforeAll(() => {
  gsap.registerPlugin(Motly);
});

afterEach(() => {
  document.body.replaceChildren();
});

describe('time vars', () => {
  it('stretches the whole burst over a given duration', () => {
    const tween = gsap.effects.burst(button(100, 50), { spec, duration: 2, paused: true });

    expect(tween.duration()).toBe(2);
    tween.progress(0.5);
    expect(overlay()?.innerHTML).toBe(oracle(origin, 0.4));
  });

  it('warps the Playhead by a given ease', () => {
    const tween = gsap.effects.burst(button(100, 50), { spec, ease: 'power2.in', paused: true });

    tween.progress(0.5);
    expect(overlay()?.innerHTML).toBe(oracle(origin, gsap.parseEase('power2.in')(0.5) * 0.8));
  });

  it('keeps drawing through an ease that overshoots past the end mid-tween', () => {
    const tween = gsap.effects.burst(button(100, 50), { spec, ease: 'back.out(3)', paused: true });
    const ease = gsap.parseEase('back.out(3)');

    for (const p of [0.3, 0.6, 0.9]) {
      expect(ease(p)).toBeGreaterThan(1);
      tween.progress(p);
      expect(overlay()?.innerHTML).toBe(oracle(origin, 0.8));
    }
    tween.progress(1);
    expect(overlay()).toBeNull();
  });

  it('holds the whole burst back by delay, while spec.delay still offsets it inside', () => {
    const delayed = { ...spec, delay: 0.2 };
    const tl = gsap.timeline({ paused: true });
    tl.burst(button(100, 50), { spec: delayed, delay: 0.5 }, 0);

    expect(tl.duration()).toBeCloseTo(1.5);
    tl.time(0.25);
    expect(overlay()).toBeNull();
    tl.time(0.75);
    expect(overlay()?.innerHTML).toBe(oracle(origin, 0.25, delayed));
  });

  it('draws the same burst on every repeat, Seed included', () => {
    const random: BurstSpec = { ...spec, radius: [0, rand(40, 120)] };
    const tween = gsap.effects.burst(button(100, 50), { spec: random, repeat: 1, paused: true });

    tween.totalProgress(0.25);
    const first = overlay()?.innerHTML;
    tween.totalProgress(0.75);

    expect(first).toBeDefined();
    expect(overlay()?.innerHTML).toBe(first);
  });

  it('draws a yoyo backward, from where the burst began, even if the Anchor has moved', () => {
    const anchor = button(100, 50);
    const tween = gsap.effects.burst(anchor, { spec, repeat: 2, yoyo: true, paused: true });

    tween.totalTime(0.2);
    place(anchor, 300, 200);
    // Through the end of the first iteration, and the end of the yoyo, where its time is 0.
    for (const t of [1, 1.6, 2]) tween.totalTime(t);
    expect(overlay()?.innerHTML).toBe(oracle(origin, 0.4));

    tween.totalTime(1.2);
    expect(overlay()?.innerHTML).toBe(oracle(origin, 0.4));
  });

  it('draws nothing for a burst that lasts no time', () => {
    const still: BurstSpec = { ...spec, children: { kind: 'circle', duration: 0 } };
    const tween = gsap.effects.burst(button(100, 50), { spec: still, paused: true });

    expect(tween.duration()).toBe(0);
    tween.progress(1);
    expect(overlay()).toBeNull();
  });
});

describe('callbacks', () => {
  it('calls onStart, onUpdate, onRepeat and onComplete as GSAP calls them on any tween', () => {
    const calls = (log: string[]) => ({
      repeat: 1,
      paused: true,
      onStart: () => log.push('start'),
      onUpdate: () => log.push('update'),
      onRepeat: () => log.push('repeat'),
      onComplete: () => log.push('complete'),
    });
    const burstLog: string[] = [];
    const plainLog: string[] = [];
    const burst = gsap.effects.burst(button(100, 50), { spec, ...calls(burstLog) });
    const plain = gsap.to({}, { duration: 0.8, ...calls(plainLog) });

    for (const p of [0.25, 0.75, 0.5, 1, 0.5, 0, 0.1, 1]) {
      burst.totalProgress(p);
      plain.totalProgress(p);
    }

    expect(burstLog).toEqual(plainLog);
    expect(burstLog).toEqual(expect.arrayContaining(['start', 'repeat', 'complete']));
  });

  it('leaves the onUpdate it is given in place', () => {
    const onUpdate = () => {};
    const tween = gsap.effects.burst(button(100, 50), { spec, onUpdate });

    expect(tween.eventCallback('onUpdate')).toBe(onUpdate);
  });
});
