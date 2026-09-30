# 28: Docs: four real-world examples

**What to build:** Four small but complete product interfaces where bursts do a job, so a developer can judge whether motly fits a product like theirs. Each shows several things the five pens show one at a time, in the kind of screen people actually ship. Spec: `.scratch/phase-2/spec.md`, "Demos and docs", user story 64.

**Blocked by:** 21

**Status:** ready-for-agent

Confirmed by the maintainer on 2026-09-30:

1. **Add to cart.** A product grid with a header cart. "Add to cart" squashes the button, the product image flies along an arc to the cart icon, a burst goes off at the cart as the image lands, and the badge count pops. It is one GSAP timeline across three elements, with `tl.burst` placed at the landing. The cart is an Anchor whose position is read when the burst starts, so resizing the page does not break it. Repeated clicks give different bursts.
2. **Daily goals.** A checklist with a progress ring. Checking an item bursts from its checkbox, and unchecking reverses that item's tween. Each milestone (a third, two thirds, all done) gets a bigger burst, built from the progress in code, which shows that a Spec is plain data. Finishing the list sets off a celebration from the ring. A reduced-motion switch shows the Resting frame and the timings staying the same.
3. **Year in review.** A scroll story in the style of a yearly recap: pinned sections, stats that count up, and a burst on each reveal, scrubbed by ScrollTrigger in container mode. Scrolling back undoes each burst exactly, because the Seed is fixed. It shows determinism and scrubbing at the length of a page, not a single section.
4. **Chat reactions, in React.** A chat thread where reacting to a message with an emoji sends a burst of that emoji from the reaction button. Written in React with `useGSAP`, so a burst is cleaned up when its message unmounts: deleting a message mid-burst leaves nothing drawn. It needs `@astrojs/react`, `react` and `react-dom` in `apps/docs` only.

- [x] The examples confirmed by the maintainer.
- [ ] Each one is a live example on a "Real-world examples" page, full width, with a link that opens it on its own page.
- [ ] Each one's code is short enough to read: product markup kept to what the example needs. Only the chat example uses a framework.
- [ ] Each one works with the keyboard, and respects reduced motion by default.
- [ ] Checked in Safari, Chrome and Firefox.
