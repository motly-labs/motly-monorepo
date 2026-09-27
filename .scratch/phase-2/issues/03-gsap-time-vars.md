# 03: GSAP time vars and the user's callbacks

**What to build:** Top-level `vars` keys mean what GSAP means (the vocabulary rule). `duration`, when given, stretches or squeezes the whole burst; `ease` is `'none'` unless given, so a Spec runs at its own pace, and a given `ease` warps the Playhead; `delay` holds back the whole burst while `spec.delay` keeps offsetting Children; `repeat` and `yoyo` work; `onStart`, `onUpdate` and `onComplete` are the user's and are called exactly as GSAP calls them, with `onUpdate` left untouched. None of these needs code beyond passing them through, because `ratio` already carries them. Spec: `.scratch/phase-2/spec.md`, "The effect call".

**Blocked by:** 02

**Status:** resolved

- [x] With `duration: d` the tween lasts `d` and the painted burst at progress `p` matches core's sample at `p` × the Instance's duration.
- [x] With no `ease` the mapping is linear; with `ease` given it is warped by that ease.
- [x] `delay` offsets the tween in its timeline; `spec.delay` still offsets Children inside the burst.
- [x] `repeat` and `yoyo` repeat and reverse the drawing; the burst is identical across repeats.
- [x] The user's `onStart`, `onUpdate` and `onComplete` are called as GSAP calls them.
- [x] Scrubbing a finished burst back into its range redraws it.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

## Comments

From ticket 02's review:

- `Drawing.render()` decides "at an end" from the eased `ratio`. An ease that overshoots (`back.out`, `elastic`) takes `ratio` past 0 or 1 mid-tween, and the overlay is released there: a probe saw it gone from progress 0.3 to 0.9 under `back.out(3)`. Decide the ends from the tween's own time, not `ratio`; the seek Driver already clamps the Playhead into the Instance's duration.
- The effect already builds `{ ease: 'none', duration: <the Instance's>, ...vars }`, so a given `ease` and `duration` pass through untested. This ticket's tests pin them.
- With `repeat`, a new iteration does not re-read the Anchor, since `ratio` never visits 0 between iterations. Decide with ticket 05 whether a repeat counts as a start from 0 moving forward.

Resolved: the plugin hands the Drawing the tween beside the eased `ratio`. The ends, and so mount and release, come from the tween's own `progress()` through its iteration, which also covers a burst that lasts no time; the Playheads come from `ratio`. An overshooting ease now draws the clamped Playhead instead of releasing mid-tween. The Anchor is read where GSAP would call `onStart`: when the tween leaves its very start (`totalProgress()` 0), not on a repeat or at the end of a yoyo, so a repeating burst stays where it began. Ticket 05 inherits this rule for "each start from 0 moving forward"; ticket 07 should read the reduced-motion preference at the same point.
