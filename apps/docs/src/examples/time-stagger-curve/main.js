import { expoIn, Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// The same span of starts, spread along a curve: slow to begin, then all at once.
const spec = {
  kind: 'burst',
  count: 16,
  stagger: { each: 0.05, easing: expoIn },
  radius: [0, 100],
  restAt: 0.6,
  children: { kind: 'circle', radius: [7, 0], fill: '#118ab2', duration: 0.7 },
};

gsap.effects.burst('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
