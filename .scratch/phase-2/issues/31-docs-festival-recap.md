# 31: Docs: party night, on the beat

**What to build:** A second storytelling example: a music-festival night recap where bursts land on the beats of a track. Its point is a custom Driver: the audio's playback position moves the Playhead, not the clock or the scroll.

**Blocked by:** 29

**Status:** ready-for-human

Proposed on 2026-09-30 as the second choice after the Perseids (29); the maintainer is considering it.

Open questions:
- A track the docs may ship: licensed, or made for the example, and its beat data.
- Whether the story drives the Playhead through `createScope({ driver })` in core, or through a GSAP timeline synced to the audio.

## Comments

Built 2026-09-30 as `apps/docs/src/examples/party-night` on the page `examples/party-night`. The maintainer asked for it after the Perseids. The open questions, answered:

- **The track:** none. The set is synthesized in the browser with the Web Audio API from a score of events (85 seconds at 124 BPM: warm-up, build, drop, break, last drop), so there is nothing to license, and the bursts come from the same events as the sound.
- **The clock:** the audio clock drives a paused GSAP timeline (`show.time(...)` in `gsap.ticker`), minus the output latency, not a core Driver. A core Timeline holds every Instance at its first frame before its start and draws it every frame, which suits a short sequence, not about 700 beat-length bursts; under `@motly/gsap` a burst is in the document only while it plays.
- **Synthesis:** a look-ahead scheduler makes each event about 250 ms before it is due, on a bus per play that pausing disconnects. Rendering the whole set offline first made seeking simpler but took about 12 seconds before anything could play; the scheduler is ready in about 0.3 s.
- **Reduced motion:** the beat bursts and beam swings are left out; each section shows one still burst for its length. At any setting nothing flashes the whole stage, and the kick rings come about twice a second, under WCAG 2.3.1's three.

Checked in headless Chrome 154 with audio playing: no errors; frame times at the build, drop, break and last drop had a median of 16.7 ms and a worst of 16.8 ms, with and without reduced motion; the section and bar counter follow the music; pausing freezes the show; seeking moves music and show together; the drop fires confetti from both speakers and a shell overhead; the set ends on "Play again".

Left by hand: listen to it (headless checks cannot), and check Safari and Firefox. A seek into the middle of the build skips the rest of its riser sweep, since that one sound starts at the build's first bar.

2026-09-30, after ticket 30 (ADR-0019): the drop's cannons are aimed fans (`angle: ±25, spread: 80`) instead of full circles, so no confetti is thrown into the floor.
