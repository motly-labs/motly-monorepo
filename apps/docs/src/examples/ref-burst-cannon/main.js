import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// Each piece holds its size for most of its flight, then shrinks away.
const piece = {
  fill: each(['#ffd166', '#ef476f', '#06d6a0']),
  scale: [1, 1, 0],
  duration: rand(1.1, 1.6),
};

// A cannon: 14 clumps fanned over 70°, centred on angle 0, straight up. Each clump is a small
// Burst of its own, so the confetti scatters instead of lining up on one arc.
const spec = {
  kind: 'burst',
  count: 14,
  angle: 0,
  spread: 70,
  radius: [0, rand(170, 220)],
  easing: 'ease-out',
  restAt: 0.35,
  children: {
    kind: 'burst',
    count: 6,
    radius: [0, rand(10, 45)],
    delay: rand(0, 0.1),
    children: each([
      { kind: 'polygon', points: 4, radius: rand(3, 6), angle: [0, rand(-180, 180)], ...piece },
      { kind: 'circle', radius: rand(2, 4), ...piece },
    ]),
  },
};

gsap.effects.burst('.origin', { spec, repeat: -1, repeatDelay: 0.4 });
