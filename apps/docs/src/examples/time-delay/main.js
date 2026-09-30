import { each, Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// Every other Child waits 0.3 s. The Burst lasts until its latest Child ends: 0.3 + 0.8 s.
const spec = {
  kind: 'burst',
  count: 12,
  radius: [0, 100],
  restAt: 0.5,
  children: {
    kind: 'circle',
    radius: [8, 0],
    fill: each(['deeppink', 'gold']),
    delay: each([0, 0.3]),
    duration: 0.8,
  },
};

gsap.effects.burst('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
