import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const ring = {
  kind: 'circle',
  radius: [10, 52],
  fill: 'none',
  stroke: ['#ff4d6d', '#ffb3c1'],
  strokeWidth: [12, 0],
  duration: 0.45,
  restAt: 0.3,
};

const sparks = {
  kind: 'burst',
  count: 14,
  radius: [30, 80],
  restAt: 0.4,
  children: {
    kind: 'circle',
    radius: [rand(3, 6), 0],
    fill: each(['#ff4d6d', '#ffd166', '#8338ec', '#3a86ff']),
    duration: rand(0.5, 0.8),
  },
};

const heart = document.querySelector('.heart');
let like;

heart.addEventListener('click', () => {
  const liked = heart.classList.toggle('liked');
  heart.setAttribute('aria-pressed', String(liked));
  // revert() clears a burst mid-flight and puts the scale back; kill() would leave it drawn.
  like?.revert();
  if (!liked) return;
  like = gsap
    .timeline()
    .to(heart, { scale: 0.6, duration: 0.12, ease: 'power2.in' })
    .shape(heart, { spec: ring })
    .to(heart, { scale: 1, duration: 0.6, ease: 'elastic.out(1.2, 0.4)' }, '<')
    .burst(heart, { spec: sparks }, '<0.05');
});
