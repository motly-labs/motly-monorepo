# 31: Docs: a festival night recap on the beat

**What to build:** A second storytelling example: a music-festival night recap where bursts land on the beats of a track. Its point is a custom Driver: the audio's playback position moves the Playhead, not the clock or the scroll.

**Blocked by:** 29

**Status:** needs-triage

Proposed on 2026-09-30 as the second choice after the Perseids (29); the maintainer is considering it.

Open questions:
- A track the docs may ship: licensed, or made for the example, and its beat data.
- Whether the story drives the Playhead through `createScope({ driver })` in core, or through a GSAP timeline synced to the audio.
