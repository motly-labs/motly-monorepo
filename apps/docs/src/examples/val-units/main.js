import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// A plain number is px, degrees or seconds. A string names another unit.
const spec = {
  kind: 'star',
  points: 5,
  radius: '70px',
  angle: [0, '1turn'],
  fill: 'none',
  stroke: '#ffd166',
  strokeWidth: 4,
  duration: '1500ms',
  restAt: 0.2,
};

gsap.effects.shape('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
