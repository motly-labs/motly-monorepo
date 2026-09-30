import { bounceOut, Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// A Curve per property, and `default` for the rest: radius bounces, opacity eases in.
const spec = {
  kind: 'circle',
  radius: [10, 80],
  opacity: [1, 0.2],
  fill: ['deeppink', 'gold'],
  easing: { radius: bounceOut, opacity: 'ease-in', default: 'linear' },
  duration: 1.4,
  restAt: 0.6,
};

gsap.effects.shape('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
