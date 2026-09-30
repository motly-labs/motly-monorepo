import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// Any SVG path, written in a 100×100 box centred on (50, 50). radius 50 draws it at that size.
const heart =
  'M50 88C22 66 6 50 6 32C6 18 17 8 30 8C39 8 46 13 50 20C54 13 61 8 70 8C83 8 94 18 94 32C94 50 78 66 50 88Z';

const spec = {
  kind: 'path',
  d: heart,
  radius: [20, 70],
  fill: '#ff4d6d',
  opacity: [1, 0],
  duration: 1.1,
  restAt: 0.3,
};

gsap.effects.shape('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
