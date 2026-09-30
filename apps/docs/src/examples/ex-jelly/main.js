import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// An SVG path curve, as drawn in a design tool: overshoot to 120%, fall back to 90%, settle.
const jelly = 'M0,100 C15,40 25,-20 40,-20 C55,-20 60,10 70,10 C80,10 90,0 100,0';

const spec = {
  kind: 'polygon',
  points: 6,
  radius: [0, 70],
  angle: [-30, 0],
  fill: '#8338ec',
  easing: { radius: jelly, default: 'ease-out' },
  duration: 1.2,
};

gsap.effects.shape('.origin', { spec, repeat: -1, repeatDelay: 0.8 });
