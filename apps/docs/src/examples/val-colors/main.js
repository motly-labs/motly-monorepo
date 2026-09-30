import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// Keyframed colors: named, hex, rgb() or rgba(). A single color can be any CSS color.
const spec = {
  kind: 'polygon',
  points: 6,
  radius: 70,
  fill: ['tomato', '#ffd166', 'rgb(6, 214, 160)', 'rgba(17, 138, 178, 0.3)'],
  stroke: 'white',
  strokeWidth: 3,
  duration: 2,
  restAt: 0.4,
};

gsap.effects.shape('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
