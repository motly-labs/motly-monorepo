# 29: Docs: a night of the Perseids, a scroll story on canvas

**What to build:** One large storytelling example, on its own docs page: a night of the Perseid meteor shower, told by scrolling from 21:00 to dawn. A meteor shower is one of the few subjects where a radial burst is the real geometry: every meteor appears to fly away from the radiant, in Perseus. Spec: `.scratch/phase-2/spec.md`, "Demos and docs", user story 65.

**Blocked by:** None (can start immediately).

**Status:** ready-for-human

The data is a model, labelled as one on the page. From the IMO 2024 Meteor Shower Calendar (the IMO site is being restored; read from the Wayback Machine copy of `imo.net/files/meteor-shower/cal2024.pdf`): Perseids, radiant α = 48°, δ = +58°, ZHR = 100, parent comet 109P/Swift-Tuttle, V∞ = 59 km/s. ZHR is the rate an ideal observer would see under a +6.5 limiting magnitude with the radiant overhead, so the modelled hourly rate is ZHR × sin(radiant altitude), for a dark site at 50° N on the peak night, in local solar time. The model leaves out twilight and the Moon.

- [x] A pinned sky: dusk to night to dawn, a horizon, about 600 twinkling stars on canvas.
- [x] The radiant climbs along its computed altitude and azimuth as the reader scrolls; each hour's meteors fly away from wherever it is.
- [x] Each hour rains at its modelled rate, one streak per meteor, streaks pointing along their rays, on a fixed Seed per hour.
- [x] A fireball that breaks apart, scrubbed, so scrolling back runs it back exactly.
- [x] A clock, a running count and an hourly-rate bar chart.
- [x] Reduced motion shows each hour's Resting frame; an epilogue shows every hour as a still tile, drawn by `@motly/core`.
- [x] Checked in headless Chrome for errors and frame time.
- [ ] Checked in Safari and Firefox by hand.

## Comments

Built 2026-09-30 as `apps/docs/src/examples/perseids` on the page `examples/perseids`, with the model, its table and its source.

- The story is one GSAP timeline, one unit per hour, scrubbed by ScrollTrigger over a pinned sky: sky colors, the radiant's path, the stars' fade, the captions, and the fireball. The rain for the hour on the clock plays live, replay after replay, each replay on the next Seed; under reduced motion it holds one Resting frame.
- Stars: three levels of Bursts, 560 circles, on canvas, twinkling through random opacity Keyframes with `repeat: -1, yoyo: true`.
- Each hour's rain is three Bursts (near, mid, far) with different counts, so their rays do not line up; two early hours add earthgrazers. Streaks point along their rays through `angle: each([...])` computed from `count` (ticket 30).
- The fireball comes at 23:40, not later: a Burst of one throws straight up, and later in the night the radiant is too high to leave it room (also on ticket 30). A head Burst a tail's length further out leads the streak; at its end a ring and 22 swirling fragments open from `.flash`, an element that rides on the radiant.
- The epilogue's eight tiles are core `Burst`s on `CanvasRenderer`s with `reducedMotion: 'always'`, from the same Specs and Seeds as each hour's first replay, with streaks drawn 2.5× larger than their distances so they show at tile size.

Checked in headless Chrome 154 at 1280×800: no errors; frame times at 21:18, 23:44, 00:30, 01:30, 03:36 and 04:48 all had a median of 16.7 ms and a worst of 16.8 ms, with and without reduced motion; the clock, count, captions and bar chart follow the scroll; every tile draws; scrubbing back to 23:44 redraws the same fireball.

Found while building: `rand(...) * scale` is `NaN`, since `rand()` returns a Descriptor, not a number; scale goes inside `rand()`.

2026-09-30, after ticket 30 (ADR-0019): the streaks use `orient: true` in place of the `angle: each([...])` workaround, and the fireball moved back to 02:30, aimed with `angle: -60`.
