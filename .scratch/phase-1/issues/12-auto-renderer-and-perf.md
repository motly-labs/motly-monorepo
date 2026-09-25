# 12: `renderer: 'auto'` and measured performance

Status: ready-for-agent
Blocked by: 11

**What to build:** A developer who does not choose a Renderer gets SVG or Canvas picked once, at creation, from the Element count (ADR-0015), and the threshold is a measured number rather than the 200-Element placeholder.

Settle first: ADR-0014 says a Renderer is constructed with the element it paints into, so `'auto'` cannot simply name a Renderer — something has to create the SVG or canvas element, and it must import both Renderers, so it cannot live in the main entry. Decide where `'auto'` lives and what it is given. It is public API that is hard to change later; weigh whether it earns an ADR.

- [ ] The shape of `'auto'` is decided and recorded.
- [ ] `'auto'` resolves once at Instance creation and never switches while playing.
- [ ] A benchmark finds the SVG/Canvas crossover and replaces the 200 threshold. The machine and benchmark are recorded in ADR-0015, as that ADR requires.
- [ ] Frame cost at 500 SVG Elements and 5,000 Canvas Elements is measured against `product.md` §1.6's 60fps targets and written down.
- [ ] If Canvas misses 5,000, a ticket is opened for the typed-array layout ADR-0013 defers. It is not built here.
