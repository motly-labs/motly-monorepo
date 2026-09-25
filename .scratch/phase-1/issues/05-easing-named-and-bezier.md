# 05: Easing — named curves and cubic-bezier

Status: ready-for-agent
Blocked by: 01

**What to build:** A developer can give any property a curve, either by name or as a cubic-bezier, and the Spec stays serializable because a curve is data, never a function.

- [ ] A set of named curves covers the common in/out/in-out families. Each is individually importable, so unused curves tree-shake out.
- [ ] A cubic-bezier given as four numbers matches CSS `cubic-bezier()` within a stated tolerance.
- [ ] A curve applies per Child property.
- [ ] A curve in a Spec is a string or a number tuple; a Spec never holds a function.
