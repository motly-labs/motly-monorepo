---
'@motly/core': minor
---

Add Timelines: `scope.timeline()` returns a Timeline whose `shape()` and `burst()` create Instances on it, each `at` a start offset or after everything so far. Play, pause, resume, reverse, seek and `setProgress` on the Timeline move every Instance on it together; its duration is the latest end on it, and `destroy()` releases its Instances. A Timeline is those Instances' Driver, so they need no change to run on it. Instances now attach to their Driver when they are created, rather than on first use: a custom Driver sees `attach()` at creation.
