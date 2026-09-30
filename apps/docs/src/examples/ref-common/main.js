import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// The fields every kind takes. Each one here is Keyframes, so each one moves.
const spec = {
  kind: 'polygon',
  points: 4,
  radius: 40,
  angle: [0, 90],
  scale: [0.5, 1.5],
  opacity: [1, 0.3],
  fill: ['deeppink', 'gold'],
  stroke: 'white',
  strokeWidth: [0, 6],
  duration: 1.2,
  restAt: 0.5,
};

gsap.effects.shape('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
