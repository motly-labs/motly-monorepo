# 15: CodePens and the GSAP forum post

**What to build:** The launch where GSAP developers already are. The five pens from ticket 10 are created on CodePen against the published IIFE, checked by hand, and linked from a GSAP forum post. Spec: `.scratch/phase-2/spec.md`, "Demos and docs", "Launch and the signal".

**Blocked by:** 10, 14

**Status:** ready-for-human

- [x] Five pens created from the sources in `apps/demos`, loading GSAP and `@motly/gsap` from a CDN.
- [x] Each pen checked by hand in Safari, Chrome and Firefox; versions noted on this ticket.
- [ ] Forum post published with the pens and the install line; link recorded here.

## Comments

Prep done 2026-09-30, for the human steps above:

- The five pens were split into CodePen panes (HTML, CSS, JS, and the external scripts in order) by a one-off script, with a local page whose "Open in CodePen" buttons post each pen to CodePen's prefill endpoint. External scripts: `gsap@3.15` (and `ScrollTrigger` for Firework) and `@motly/gsap@0.1` from jsDelivr.
- The panes, rebuilt as pages that load only from the CDN, ran headless in Chrome 154: GSAP 3.15.0 and `@motly/gsap` 0.1.1 loaded from jsDelivr, no page errors or warnings, each pen drew a layer during its interaction and left none once it settled (repeated clicks, an unlike mid-flight, a reverse mid-ripple, the firework scrubbed down and back up). Not a substitute for the hand check in Safari, Chrome and Firefox.
- Each pen's title, description and tags, and the collection's name and description, are in `.scratch/phase-2/codepen-copy.md`; the prefill buttons send the pen's copy with its panes. CodePen cannot prefill a collection, so it is made by hand.
- Collection: https://codepen.io/collection/kkrLNz
- Heart like burst: https://codepen.io/realdreamer/pen/01a0f289-4ec7-7fcd-ae21-06a37c3c4e83
- Confetti cannon: https://codepen.io/realdreamer/pen/01a0f2aa-ce1a-7cdf-820c-86e1bac0b437
- Scroll-scrubbed fireworks: https://codepen.io/realdreamer/pen/01a0f2af-63a4-70e2-aeeb-53aa7f193ecd
- Click sparkles: https://codepen.io/realdreamer/pen/01a0f2b2-4955-7f79-8b31-5c6483dcb099
- Reversible ripple toggle: https://codepen.io/realdreamer/pen/01a0f2b7-a4b9-73ea-a610-47e1627e7d1e
- The forum post is drafted in `.scratch/phase-2/gsap-forum-post.md`, with a placeholder per pen link.

Hand check, 2026-09-30, on macOS: Safari 26.6.2 (21624.5.1.11.3), Firefox 157.0 (aarch64), and Chrome 154.0.8037.57 (arm64).
