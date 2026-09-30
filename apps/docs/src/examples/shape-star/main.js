import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// One Element, not a burst: gsap.effects.shape takes a Shape's Spec.
const spec = {
  kind: 'star',
  points: 5,
  radius: [0, 70],
  angle: [0, 144],
  fill: 'none',
  stroke: 'gold',
  strokeWidth: [8, 0],
  duration: 0.7,
  restAt: 0.5,
};

const button = document.querySelector('button');
button.addEventListener('click', () => gsap.effects.shape(button, { spec }));
gsap.effects.shape(button, { spec });
