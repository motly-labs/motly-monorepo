# CodePen copy

Titles, descriptions and tags for the five launch pens, and the collection that holds them
(ticket 15). The pen sources are `apps/demos/pens/`. Each `##` section below is read by the
one-off prefill generator: `Title:` and `Tags:` are one line each (CodePen allows 5 tags), and
`Description:` runs to the next section.

## Collection

Name: motly × GSAP: procedural bursts

Description:
Bursts, sparkles, confetti and fireworks made by motly and driven by GSAP. motly generates the
shapes from a small JSON Spec; its GSAP plugin, @motly/gsap, makes each burst an ordinary tween,
so it goes in a timeline, scrubs with ScrollTrigger, reverses, and is cleaned up by
gsap.context() and useGSAP. Each pen shows one thing GSAP adds.

Try it with two script tags, GSAP first, then https://cdn.jsdelivr.net/npm/@motly/gsap@0.1
or npm install @motly/gsap gsap.

Docs: https://motly-labs.github.io/motly-monorepo/
Source and issues: https://github.com/motly-labs/motly-monorepo

## heart

Title: Heart like burst · GSAP timeline + motly

Tags: gsap, motly, timeline, like-button, microinteraction

Description:
Click the heart. One GSAP timeline plays a squash, a motly ring, an elastic pop and a motly
spark burst, placed with position parameters like any other tween. Click again to unlike:
revert() clears a burst mid-flight and puts the scale back.

The bursts are JSON Specs; rand() and each() vary every spark.

Made with @motly/gsap 0.1, procedural bursts as GSAP tweens.
Docs: https://motly-labs.github.io/motly-monorepo/
Source: https://github.com/motly-labs/motly-monorepo

## confetti

Title: Confetti cannon · tl.burst() position parameter + motly

Tags: gsap, motly, confetti, timeline, celebration

Description:
Click Celebrate. Confetti bursts from the button, then from both sides 0.25 s later: three
tl.burst() calls placed with '<', '<0.25' and '<'. Stars, squares, dots and streamers come from
one Spec with each(); the side bursts start from { x, y } points in viewport pixels.

Made with @motly/gsap 0.1, procedural bursts as GSAP tweens.
Docs: https://motly-labs.github.io/motly-monorepo/
Source: https://github.com/motly-labs/motly-monorepo

## firework

Title: Scroll-scrubbed fireworks · ScrollTrigger + motly

Tags: gsap, motly, scrolltrigger, fireworks, scroll-animation

Description:
Scroll down, then back up. ScrollTrigger pins the section and scrubs a timeline of three
rockets; each opens into a shell of 240 sparks, and the whole show plays backwards as you scroll
up. container: '.sky' paints the bursts inside the section, so they scroll with it and are
clipped by it. Bursts this large switch to canvas on their own.

Made with @motly/gsap 0.1, procedural bursts as GSAP tweens.
Docs: https://motly-labs.github.io/motly-monorepo/
Source: https://github.com/motly-labs/motly-monorepo

## sparkle

Title: Click sparkles · burst at the pointer with GSAP + motly

Tags: gsap, motly, click-effect, sparkle, microinteraction

Description:
Click anywhere. Each click fires gsap.effects.burst() at { x: clientX, y: clientY }: a burst
from a point instead of an element. Every burst is its own tween and cleans itself up when it
ends, so clicking fast leaves nothing behind.

Made with @motly/gsap 0.1, procedural bursts as GSAP tweens.
Docs: https://motly-labs.github.io/motly-monorepo/
Source: https://github.com/motly-labs/motly-monorepo

## ripple

Title: Reversible ripple toggle · GSAP reverse() + motly

Tags: gsap, motly, reverse, toggle, microinteraction

Description:
Click the + to open, click again to close, even mid-ripple. A paused GSAP timeline holds the
icon's turn and a motly burst; play() runs it forward and reverse() runs the burst back into the
button, frame by frame, because a burst is an ordinary tween.

Made with @motly/gsap 0.1, procedural bursts as GSAP tweens.
Docs: https://motly-labs.github.io/motly-monorepo/
Source: https://github.com/motly-labs/motly-monorepo
