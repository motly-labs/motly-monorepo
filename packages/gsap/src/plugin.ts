import type { BurstSpec, Origin, ReducedMotion, ShapeKind, ShapeSpec } from '@motly/core';
// Aliased: `gsap` names GSAP's global namespace, which this file augments.
import type { gsap as GSAPInstance } from 'gsap';
import { type Anchor, Drawing, type RendererName } from './drawing.js';

type GSAP = typeof GSAPInstance;

/**
 * What a GSAP effect is called on, GSAP's `targets`: Anchors, as an element, a selector or a list
 * of them, or Origins, as `{ x, y }` in viewport CSS pixels.
 */
type AnchorsOrOrigins = string | Anchor | Origin | ArrayLike<string | Anchor | Origin>;

/**
 * The vars every motly GSAP effect takes beside its Spec: four binding keys, and GSAP's own tween
 * vars with GSAP's meaning, less the four a burst or a Shape cannot honour. Reach for it to type a
 * helper that sets these keys for either effect, such as a project's default `renderer`.
 */
export interface MotlyVars extends gsap.TweenVars {
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
  /**
   * Leave it at `'user'`, which shows a viewer who prefers reduced motion the Spec's still Resting
   * frame for the tween's full length, read each time the tween starts from 0, not on a repeat.
   * Force `'always'` or `'never'` only in a demo or a test (ADR-0012).
   */
  reducedMotion?: ReducedMotion;
  /** Rejected by the types, ignored at runtime: it would replace the burst's time with steps. */
  keyframes?: never;
  /** Rejected by the types, ignored at runtime: the tween has no property to start from. */
  startAt?: never;
  /** Rejected by the types, ignored at runtime: reverse the tween, or play it from its end. */
  runBackwards?: never;
  /** Rejected by the types, ignored at runtime: stagger with a loop or timeline positions. */
  stagger?: never;
}

/**
 * What `gsap.effects.burst()` and `tl.burst()` take: a Burst's Spec, as exported whole. Reach for
 * it to type vars built apart from the call, as in a wrapper that fires the same burst everywhere.
 */
export interface BurstVars extends MotlyVars {
  spec: BurstSpec;
}

/**
 * What `gsap.effects.shape()` and `tl.shape()` take: one Element's Spec, of kind `K`. Reach for it
 * to type vars built apart from the call; name `K` to keep that kind's parameters checked.
 */
export interface ShapeVars<K extends ShapeKind = ShapeKind> extends MotlyVars {
  spec: ShapeSpec<K>;
}

declare global {
  namespace gsap {
    interface EffectsMap {
      /**
       * Throw a burst from each target: a tween as long as the Spec, which timelines, scrubbing and
       * `gsap.context()` treat as any other. Needs `gsap.registerPlugin(Motly)` first.
       */
      burst(targets: AnchorsOrOrigins, vars: BurstVars): gsap.core.Tween;
      /** Draw one Element from each target, as `burst` does: a ring, a star, a single spark. */
      shape<K extends ShapeKind>(targets: AnchorsOrOrigins, vars: ShapeVars<K>): gsap.core.Tween;
    }
    namespace core {
      interface Timeline {
        /** Add a burst at `position`, as `gsap.effects.burst()` would draw it. */
        burst(targets: AnchorsOrOrigins, vars: BurstVars, position?: gsap.Position): this;
        /** Add a Shape at `position`, as `gsap.effects.shape()` would draw it. */
        shape<K extends ShapeKind>(
          targets: AnchorsOrOrigins,
          vars: ShapeVars<K>,
          position?: gsap.Position,
        ): this;
      }
    }
  }
}

/** What the plugin keeps per tween, between `init()` and each `render()`. */
interface PluginData {
  drawing: Drawing;
  tween: gsap.core.Tween;
}

/** The plugin's key on the private proxy each burst tween animates. Not an API. */
const KEY = 'motly';

/**
 * GSAP's tween vars a burst cannot honour: each would reshape a tween whose time is the burst's.
 * `stagger` across targets is a loop or timeline positions away.
 */
const UNSUPPORTED = ['keyframes', 'startAt', 'runBackwards', 'stagger'] as const;

/** Draw `vars.spec` from `targets`, as the GSAP effect `name`, in a tween GSAP drives. */
function draw(
  core: GSAP,
  name: 'burst' | 'shape',
  targets: (Anchor | Origin)[],
  vars: BurstVars | ShapeVars,
): gsap.core.Tween {
  const { spec, seed, container, renderer = 'auto', reducedMotion = 'user', ...tweenVars } = vars;
  // As GSAP warns for a tween's own targets; GSAP has already resolved a selector into none here.
  if (targets.length === 0) console.warn(`motly: ${name} target not found, so it draws nothing.`);
  // Given here, it takes the place of one set with gsap.defaults(), so that one is called instead.
  const onInterrupt = vars.onInterrupt ?? core.defaults().onInterrupt;
  // Resolved as GSAP resolves targets, so a selector is scoped by a gsap.context() it runs in.
  const [element] = container === undefined ? [] : core.utils.toArray<HTMLElement>(container);
  // Nowhere to paint draws nothing, as nothing to burst from does: over the viewport it would be
  // neither clipped nor scrolled as the container asked.
  const lost = container !== undefined && element === undefined;
  if (lost) console.warn(`motly: ${name} container not found, so it draws nothing.`);
  const drawing = new Drawing(spec, lost ? [] : targets, {
    seed,
    container: element,
    rendererName: renderer,
    reducedMotion,
  });
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
    // Per registration, never per module (Invariant 3): another copy of GSAP warns again.
    let warned = false;
    const supported = <V extends MotlyVars>(vars: V): V => {
      const given = UNSUPPORTED.filter((key) => key in vars);
      if (given.length === 0) return vars;
      if (!warned) {
        warned = true;
        console.warn(`motly: ${UNSUPPORTED.join(', ')} are ignored on a burst or a shape.`);
      }
      const kept = { ...vars };
      for (const key of given) delete kept[key];
      return kept;
    };
    for (const name of ['burst', 'shape'] as const) {
      core.registerEffect({
        name,
        extendTimeline: true,
        effect: (targets: (Anchor | Origin)[], vars: BurstVars | ShapeVars) =>
          draw(core, name, targets, supported(vars)),
      });
    }
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
