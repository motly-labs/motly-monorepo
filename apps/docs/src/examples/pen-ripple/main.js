import { each, Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const ripple = {
  kind: 'burst',
  count: 16,
  radius: [0, 110],
  stagger: { each: 0.04, easing: 'ease-in' },
  restAt: 0.5,
  children: {
    kind: 'star',
    points: 4,
    innerRadius: 0.35,
    radius: [14, 0],
    angle: [0, 90],
    fill: each(['#ef6f6c', '#f7b267']),
    duration: 0.7,
  },
};

const toggle = document.querySelector('.toggle');
const tl = gsap
  .timeline({ paused: true })
  .to('.toggle span', { rotate: 135, duration: 0.5, ease: 'back.out(2)' })
  .burst(toggle, { spec: ripple }, 0);

toggle.addEventListener('click', () => {
  const opening = tl.progress() === 0 || tl.reversed();
  opening ? tl.play() : tl.reverse();
  toggle.setAttribute('aria-expanded', String(opening));
  toggle.setAttribute('aria-label', opening ? 'Close' : 'Open');
});
