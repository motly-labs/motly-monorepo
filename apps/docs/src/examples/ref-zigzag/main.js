import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// Turned 90° to run left to right; amplitude is how far each corner swings.
const spec = {
  kind: 'zigzag',
  points: 9,
  radius: 110,
  angle: 90,
  amplitude: [0, 24, 0],
  stroke: '#ffd166',
  strokeWidth: 4,
  duration: 1.4,
  restAt: 0.5,
};

gsap.effects.shape('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
