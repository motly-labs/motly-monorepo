import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// spread 0 sends every Child along one ray; stagger lets them out one after another.
const spec = {
  kind: 'burst',
  count: 14,
  angle: 50,
  spread: 0,
  stagger: 0.06,
  radius: [0, 240],
  easing: 'ease-out',
  restAt: 0.5,
  children: { kind: 'circle', radius: [7, 1], fill: ['#22d3ee', '#8b5cf6'], duration: 0.9 },
};

gsap.effects.burst('.origin', { spec, repeat: -1, repeatDelay: 0.3 });
