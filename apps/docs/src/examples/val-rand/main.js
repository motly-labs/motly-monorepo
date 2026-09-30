import { Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// Every Child draws its own size, spin and duration. The Seed stays the same for the whole tween,
// so each repeat is identical; Replay starts a new tween with a new Seed.
const spec = {
  kind: 'burst',
  count: 14,
  radius: [0, rand(80, 120)],
  restAt: 0.4,
  children: {
    kind: 'star',
    points: 5,
    radius: [rand(4, 14), 0],
    angle: [0, rand(-360, 360)],
    fill: 'gold',
    duration: rand(0.6, 1.4),
  },
};

gsap.effects.burst('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
