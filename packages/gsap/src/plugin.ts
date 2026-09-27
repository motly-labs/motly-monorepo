import type { BurstSpec } from '@motly/core';
import type { gsap } from 'gsap';
import { Drawing } from './drawing.js';

type GSAP = typeof gsap;

/** What `gsap.effects.burst()` and `tl.burst()` take: the Spec, and GSAP's own tween vars. */
interface BurstVars extends gsap.TweenVars {
  spec: BurstSpec;
}

/** What the plugin keeps per tween, between `init()` and each `render()`. */
interface PluginData {
  drawing: Drawing;
  tween: gsap.core.Tween;
}

/** The plugin's key on the private proxy each burst tween animates. Not an API. */
const KEY = 'motly';

function burst(core: GSAP, targets: object[], vars: BurstVars): gsap.core.Tween {
  const { spec, ...tweenVars } = vars;
  // Given here, it takes the place of one set with gsap.defaults(), so that one is called instead.
  const onInterrupt = vars.onInterrupt ?? core.defaults().onInterrupt;
  const drawing = new Drawing(spec, targets as Element[]);
  return core.to(
    {},
    {
      ease: 'none',
      duration: drawing.duration,
      ...tweenVars,
      // kill() mid-flight reaches no render of the plugin, only this (ADR-0018): clear the burst,
      // then hand over to the user's own, called as GSAP would have called it.
      onInterrupt(this: unknown, ...args: unknown[]) {
        drawing.release();
        onInterrupt?.apply(this, args);
      },
      [KEY]: drawing,
    },
  );
}

/**
 * motly's GSAP plugin. Pass it to `gsap.registerPlugin(Motly)` once, then fire a burst the way
 * you fire any GSAP effect: `gsap.effects.burst(button, { spec })`, or place one in a timeline
 * with `tl.burst(button, { spec }, '<')`. Each returns an ordinary tween.
 */
export const Motly = {
  name: KEY,
  // Registers where there is no window, as on a server, instead of waiting for one.
  headless: true,
  // Hand init() the Drawing as is, rather than as GSAP's processed tween values.
  rawVars: true,
  /** Registers the effects on the copy of GSAP the host registered the plugin with. */
  register(core: GSAP): void {
    core.registerEffect({
      name: 'burst',
      extendTimeline: true,
      effect: (targets: object[], vars: BurstVars) => burst(core, targets, vars),
    });
  },
  init(this: Partial<PluginData>, _proxy: object, drawing: Drawing, tween: gsap.core.Tween): void {
    this.drawing = drawing;
    this.tween = tween;
  },
  // GSAP calls this on every render of the tween, including those with events suppressed, as
  // tl.revert() makes at ratio 0 (ADR-0018).
  render(ratio: number, { drawing, tween }: PluginData): void {
    drawing.render(ratio, tween);
  },
};
