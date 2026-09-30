import { Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const spec = {
  kind: 'burst',
  count: 16,
  radius: [0, 200],
  restAt: 0.3,
  children: { kind: 'circle', radius: [rand(5, 10), 0], fill: 'deeppink', duration: 1 },
};

const button = document.querySelector('button');
button.addEventListener('click', () => {
  // The burst still comes from the button, but it is painted in the card.
  gsap.effects.burst(button, { spec, container: '.card' });
});
