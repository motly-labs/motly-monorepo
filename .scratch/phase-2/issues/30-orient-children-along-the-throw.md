# 30: Orient a Burst's Children along their throw

**What to build:** A way to turn each Child of a Burst to face the direction it is thrown, so streaks, sparks and arrows point outward without computing an `angle` per Child. Found while building ticket 29: every meteor streak needs `angle: each([...])` computed from `count`, which works because a Spec is data, but every example of this kind hits the same gap.

**Blocked by:** None.

**Status:** needs-triage

Questions for triage:
- Where it lives: a Burst field (such as `orient: true`), or a Child field.
- How it combines with the Child's own `angle`: added to it, so `angle` stays relative to the ray.
- How it combines with a Swirl, whose throw turns: face the ray, or the path's tangent.
- Whether it is v1 at all, or post-v1 (ADR-0007). It is a core API change and needs a changeset.
- A related gap from the same example: a Burst cannot rotate its rays. They always start at 12 o'clock, so a Burst of one always throws straight up, and ticket 29's fireball had to be timed for when that direction had room. A start angle on the Burst would cover it; triage the two together.
