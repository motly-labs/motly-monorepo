import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// A line runs from 12 o'clock to 6; angle turns it.
const spec = {
  kind: 'line',
  radius: 80,
  angle: [0, 180],
  stroke: ['#06d6a0', '#118ab2'],
  strokeWidth: 6,
  duration: 1.2,
  restAt: 0.25,
};

gsap.effects.shape('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
