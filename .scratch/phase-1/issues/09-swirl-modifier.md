# 09: Swirl — the Modifier

Status: ready-for-agent
Blocked by: 02

**What to build:** A developer can wrap a Child in a Swirl to bend its path, and nest Swirls and Bursts inside each other. A Modifier wraps exactly one Child and draws nothing itself (ADR-0010). Parameters follow mojs's Swirl (size, frequency, direction) unless there is a reason not to.

- [ ] A Swirl wraps exactly one Child and changes its motion.
- [ ] A Swirl contributes no record of its own to the Draw list.
- [ ] A Burst of Swirls and a Swirl around a Burst both work.
- [ ] Derived duration passes through a Modifier unchanged.
- [ ] No mojs source is copied without a `NOTICE` entry.
