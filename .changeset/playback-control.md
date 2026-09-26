---
'@motly/core': minor
---

Add playback control: `pause()`, `resume()`, `reverse()`, `seek(t)` in seconds and `setProgress(p)` on every Instance, working before the first `play()` too, so an effect can be scrubbed from a slider. Add `onStart`, `onUpdate` and `onComplete` callbacks to the binding. `play()` resolves the first time the Playhead reaches the end moving forward, by playing or seeking; `destroy()` resolves it and it never rejects.

Breaking, for custom Drivers: `Driver.play(target)` is now `Driver.attach(target)`, returning a `Playback` with `play`, `pause`, `resume`, `reverse`, `seek` and `stop`, and the Driver calls `target.finish()` when its Playhead reaches the end moving forward.
