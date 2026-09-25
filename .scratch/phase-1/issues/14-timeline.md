# 14: Timeline

Status: ready-for-agent
Blocked by: 08

**What to build:** A developer can sequence several Instances on one Timeline and play, pause, seek and reverse them together. A Timeline is a Driver that maps its own Playhead onto its Instances' Playheads, not a second playback engine (ADR-0009, ADR-0010).

- [ ] A Timeline places Instances at start offsets and drives them through the Driver interface.
- [ ] Play, pause, seek and reverse on the Timeline act on every Instance in it.
- [ ] A Timeline's duration is derived from its Instances.
- [ ] Instances need no change to run under a Timeline.
- [ ] A Timeline and its Instances are released together by `destroy()`, with no module-level state.
