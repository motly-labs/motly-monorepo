import { Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const ring = {
  kind: 'circle',
  radius: [30, 70],
  fill: 'none',
  stroke: '#06d6a0',
  strokeWidth: [6, 0],
  duration: 0.5,
  restAt: 0.2,
};
const dots = {
  kind: 'burst',
  count: 6,
  radius: [40, 80],
  restAt: 0.3,
  children: { kind: 'circle', radius: [rand(2, 4), 0], fill: '#06d6a0', duration: 0.5 },
};

const button = document.querySelector('button');

button.addEventListener('click', () => {
  button.textContent = 'Copied';
  gsap
    .timeline()
    .shape(button, { spec: ring })
    .burst(button, { spec: dots }, '<0.05')
    .call(
      () => {
        button.textContent = 'Copy link';
      },
      [],
      1.5,
    );
});
