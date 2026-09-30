# GSAP forum post — draft

Draft for ticket 15. Pen links filled in; post once the hand check is done.
Pick the forum category on gsap.com/community when posting; this draft does not assume one.

---

**Title:** motly: procedural bursts as GSAP effects (sequence, scrub and reverse them like any tween)

Hi all,

I've been building **motly**, a small library that *generates* motion graphics (bursts of stars,
circles, confetti, sparks) from a JSON description, and `@motly/gsap` is its GSAP plugin. A burst
is an ordinary tween, so it goes in a timeline, scrubs with ScrollTrigger, reverses, repeats, and
is cleaned up by `gsap.context()` and `useGSAP`.

```js
gsap.effects.burst(button, { spec });                          // one-off
gsap.timeline().to(button, { scale: 0.9 }).burst(button, { spec }, '<');  // in a timeline
```

Five pens, each showing something that needs GSAP to drive it (all in one collection: https://codepen.io/collection/kkrLNz):

- **Heart like burst**: timeline sequencing: a squash, a ring, an elastic pop and sparks, one timeline. https://codepen.io/realdreamer/pen/01a0f289-4ec7-7fcd-ae21-06a37c3c4e83
- **Confetti cannon**: `tl.burst()` with the position parameter: the button, then both sides `'<0.25'` later. https://codepen.io/realdreamer/pen/01a0f2aa-ce1a-7cdf-820c-86e1bac0b437
- **Scroll-scrubbed fireworks**: ScrollTrigger scrubbing a pinned section; bursts paint inside the section (`container`) and scrub both ways. https://codepen.io/realdreamer/pen/01a0f2af-63a4-70e2-aeeb-53aa7f193ecd
- **Click sparkles**: a burst at the pointer, from `{ x: clientX, y: clientY }`. https://codepen.io/realdreamer/pen/01a0f2b2-4955-7f79-8b31-5c6483dcb099
- **Reversible ripple toggle**: a paused timeline toggled with `play()` and `reverse()`; the burst runs backwards too. https://codepen.io/realdreamer/pen/01a0f2b7-a4b9-73ea-a610-47e1627e7d1e

Try it with two script tags, GSAP first:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@motly/gsap@0.1"></script>
```

or `npm install @motly/gsap gsap`, then `gsap.registerPlugin(Motly)`.

A few things that might matter to you:

- **Vocabulary:** GSAP's keys (`delay`, `ease`, `duration`, `repeat`, `scrollTrigger`…) mean what
  they always mean; motly's own words stay inside `spec`.
- **Cleanup:** a burst never outlives its tween: at either end, on `kill()`/`revert()`, and on
  context revert. One known gap: `tl.kill()` on a timeline doesn't reach its children, so revert
  the timeline or context instead.
- **Reduced motion:** viewers who prefer it get a still frame for the tween's length, so the
  timeline keeps its timing.
- **Rendering:** SVG for small bursts, canvas for large ones, picked automatically.

It's 0.1, so I'd really value feedback from people who use GSAP daily: what feels wrong next to
the rest of the API, what you'd want a burst to do that it can't. Issues are open on GitHub:
https://github.com/motly-labs/motly-monorepo, and the README is at
https://www.npmjs.com/package/@motly/gsap.

Thanks for GSAP, and for taking a look.
