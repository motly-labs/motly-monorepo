# 29: Docs: a night of the Perseids, a scroll story on canvas

**What to build:** One large storytelling example, on its own docs page: a night of the Perseid meteor shower, told by scrolling from 21:00 to dawn. A meteor shower is one of the few subjects where a radial burst is the real geometry: every meteor appears to fly away from the radiant, in Perseus. Spec: `.scratch/phase-2/spec.md`, "Demos and docs", user story 65.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

The data is a model, labelled as one on the page. From the IMO 2024 Meteor Shower Calendar (the IMO site is being restored; read from the Wayback Machine copy of `imo.net/files/meteor-shower/cal2024.pdf`): Perseids, radiant α = 48°, δ = +58°, ZHR = 100, parent comet 109P/Swift-Tuttle, V∞ = 59 km/s. ZHR is the rate an ideal observer would see under a +6.5 limiting magnitude with the radiant overhead, so the modelled hourly rate is ZHR × sin(radiant altitude), for a dark site at 50° N on the peak night, in local solar time. The model leaves out twilight and the Moon.

- [ ] A pinned sky: dusk to night to dawn, a horizon, about 600 twinkling stars on canvas.
- [ ] The radiant climbs along its computed altitude and azimuth as the reader scrolls; each hour's meteors fly away from wherever it is.
- [ ] Each hour rains at its modelled rate, one streak per meteor, streaks pointing along their rays, on a fixed Seed per hour.
- [ ] A fireball that breaks apart, scrubbed, so scrolling back runs it back exactly.
- [ ] A clock, a running count and an hourly-rate bar chart.
- [ ] Reduced motion shows each hour's Resting frame; an epilogue shows every hour as a still tile, drawn by `@motly/core`.
- [ ] Checked in headless Chrome for errors and frame time; Safari and Firefox by hand.
