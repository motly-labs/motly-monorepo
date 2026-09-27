# 03: GSAP time vars and the user's callbacks

**What to build:** Top-level `vars` keys mean what GSAP means (the vocabulary rule). `duration`, when given, stretches or squeezes the whole burst; `ease` is `'none'` unless given, so a Spec runs at its own pace, and a given `ease` warps the Playhead; `delay` holds back the whole burst while `spec.delay` keeps offsetting Children; `repeat` and `yoyo` work; `onStart`, `onUpdate` and `onComplete` are the user's and are called exactly as GSAP calls them, with `onUpdate` left untouched. None of these needs code beyond passing them through, because `ratio` already carries them. Spec: `.scratch/phase-2/spec.md`, "The effect call".

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] With `duration: d` the tween lasts `d` and the painted burst at progress `p` matches core's sample at `p` × the Instance's duration.
- [ ] With no `ease` the mapping is linear; with `ease` given it is warped by that ease.
- [ ] `delay` offsets the tween in its timeline; `spec.delay` still offsets Children inside the burst.
- [ ] `repeat` and `yoyo` repeat and reverse the drawing; the burst is identical across repeats.
- [ ] The user's `onStart`, `onUpdate` and `onComplete` are called as GSAP calls them.
- [ ] Scrubbing a finished burst back into its range redraws it.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` green.
