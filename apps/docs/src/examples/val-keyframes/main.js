import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// Four radius Keyframes and three fill Keyframes, each spread evenly over the 2 seconds.
const spec = {
  kind: 'circle',
  radius: [10, 70, 30, 90],
  fill: ['deeppink', 'gold', '#06d6a0'],
  duration: 2,
  restAt: 0.5,
};

gsap.effects.shape('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
