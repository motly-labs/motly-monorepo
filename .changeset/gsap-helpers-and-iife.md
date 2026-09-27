---
'@motly/gsap': minor
---

`rand`, `each` and the named curves are exported from `@motly/gsap`, so a Spec needs no second import. A script build, `dist/motly.iife.js`, is what `https://cdn.jsdelivr.net/npm/@motly/gsap` and unpkg serve: it bundles core, makes the plugin the page's global `Motly`, carrying `Motly.rand`, `Motly.each` and the curves, and registers it when GSAP's own script tag came first, so a page needs two script tags and no build step. Loaded before GSAP, it only defines `Motly`; call `gsap.registerPlugin(Motly)` yourself. The package's entry still registers nothing on import.
