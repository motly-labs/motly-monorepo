# motly

[![CI](https://img.shields.io/github/actions/workflow/status/motly-labs/motly-monorepo/ci.yml?branch=main&label=CI)](https://github.com/motly-labs/motly-monorepo/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/github/actions/workflow/status/motly-labs/motly-monorepo/docs.yml?branch=main&label=docs)](https://motly-labs.github.io/motly-monorepo/)
[![License: MIT](https://img.shields.io/github/license/motly-labs/motly-monorepo)](LICENSE)

Procedural motion graphics for the web: bursts, swirls, generated shapes, declarative
parametric animation. After Effects thinking, in code you'd write for React.

GSAP, Motion and anime.js animate DOM that already exists. `motly` generates the thing
being animated, and composes it.

**Status: pre-1.0.** `@motly/core` and `@motly/gsap` are on npm; the API can still
change between minor versions.

**[Read the docs →](https://motly-labs.github.io/motly-monorepo/)** Every Spec field with a live
example, plus real-world examples to copy.

## Packages

| Package | Version | Downloads | Size | What |
| --- | --- | --- | --- | --- |
| [`@motly/core`](packages/core) | [![npm](https://img.shields.io/npm/v/@motly/core)](https://www.npmjs.com/package/@motly/core) | [![downloads](https://img.shields.io/npm/dm/@motly/core)](https://www.npmjs.com/package/@motly/core) | [![size](https://img.shields.io/bundlejs/size/@motly/core)](https://bundlejs.com/?q=@motly/core) | The engine. Zero runtime dependencies. Renderers ship as subpaths: `/svg`, `/canvas`, `/auto`. |
| [`@motly/gsap`](packages/gsap) | [![npm](https://img.shields.io/npm/v/@motly/gsap)](https://www.npmjs.com/package/@motly/gsap) | [![downloads](https://img.shields.io/npm/dm/@motly/gsap)](https://www.npmjs.com/package/@motly/gsap) | [![size](https://img.shields.io/bundlejs/size/@motly/gsap)](https://bundlejs.com/?q=@motly/gsap) | GSAP plugin. Bursts as `gsap.effects.*`, so they live in timelines, scrub and clean up with GSAP. |

Start with `@motly/gsap` if you already use GSAP, `@motly/core` if you don't. Each package's
README has install steps and a first burst.

Planned after v1, not published: `@motly/motion` (Motion adapter), `@motly/react` (components
and hooks) and `@motly/presets` (ready-made effects).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, the architecture rules and how releases work.

## License

[MIT](LICENSE)
