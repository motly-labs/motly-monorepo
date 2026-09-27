import type { BurstSpec, Origin } from '@motly/core';
import type { gsap } from 'gsap';
import { type Anchor, Drawing, type RendererName } from './drawing.js';

type GSAP = typeof gsap;

/** What `gsap.effects.burst()` and `tl.burst()` take: the Spec, and GSAP's own tween vars. */
interface BurstVars extends gsap.TweenVars {
  spec: BurstSpec;
  /**
   * Give one when a burst must look the same on every page load, as in a test or a screenshot:
   * target `i` draws from `seed + i`. Without one, each effect call draws a random Seed.
   */
  seed?: number;
  /**
   * Give one, an element or a selector, when the burst must scroll with a section or be clipped by
   * a card, as a ScrollTrigger-scrubbed burst should. The burst is painted inside it rather than
   * over the viewport. It must have a size of its own; a static one is made relative.
   */
  container?: HTMLElement | string;
  /**
   * Leave it at `'auto'`, which paints bursts under 50 Elements in SVG and larger ones on a canvas
   * (ADR-0015). Name `'svg'` when a large burst must still be inspected or styled with CSS, and
   * `'canvas'` to paint a small one on a canvas as well.
   */
  renderer?: RendererName;
}

/** What the plugin keeps per tween, between `init()` and each `render()`. */
interface PluginData {
  drawing: Drawing;
  tween: gsap.core.Tween;
}

/** The plugin's key on the private proxy each burst tween animates. Not an API. */
const KEY = 'motly';

function burst(core: GSAP, targets: (Anchor | Origin)[], vars: BurstVars): gsap.core.Tween {
  const { spec, seed, container, renderer = 'auto', ...tweenVars } = vars;
  // As GSAP warns for a tween's own targets; GSAP has already resolved a selector into none here.
  if (targets.length === 0) console.warn('motly: burst target not found, so it draws nothing.');
  // Given here, it takes the place of one set with gsap.defaults(), so that one is called instead.
  const onInterrupt = vars.onInterrupt ?? core.defaults().onInterrupt;
  // Resolved as GSAP resolves targets, so a selector is scoped by a gsap.context() it runs in.
  const [element] = container === undefined ? [] : core.utils.toArray<HTMLElement>(container);
  if (container !== undefined && element === undefined) {
    console.warn('motly: burst container not found, so it is drawn over the viewport.');
  }
  const drawing = new Drawing(spec, targets, { seed, container: element, rendererName: renderer });
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
      effect: (targets: (Anchor | Origin)[], vars: BurstVars) => burst(core, targets, vars),
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
