# `renderer: 'auto'` resolves once, at creation

An Instance created with `renderer: 'auto'` picks SVG or Canvas from the Element count its Spec will produce, once, when it is created. It never switches while playing. A Renderer owns DOM (ADR-0014), so switching mid-flight would mean tearing one down and building another mid-animation.

The threshold starts at 200 Elements and must be replaced with a number measured during Phase 1; `product.md` §1.6 targets 60fps at 500 SVG shapes, so the switch belongs well below that.

## Consequences

- Instances in one Scope may use different Renderers. They paint unrelated Elements, so this is allowed.
- The threshold is a measurement, not a preference. Record the machine and the benchmark alongside it when it changes.
