import { Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const spec = {
  kind: 'burst',
  count: 12,
  radius: [0, 90],
  restAt: 0.4,
  children: { kind: 'circle', radius: [rand(4, 9), 0], fill: 'deeppink', duration: 0.8 },
};

const button = document.querySelector('button');
button.addEventListener('click', () => gsap.effects.burst(button, { spec }));

// Or in a timeline, placed with GSAP's position parameter. This one plays as the page loads:
gsap
  .timeline()
  .to(button, { scale: 0.9, yoyo: true, repeat: 1, duration: 0.1 })
  .burst(button, { spec }, '<');
