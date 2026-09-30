import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(Motly, ScrollTrigger);

// A shell of 10 bursts of 24 sparks: 240 Elements, so 'auto' paints it on a canvas.
const shell = (colors) => ({
  kind: 'burst',
  count: 10,
  radius: [0, 60],
  restAt: 0.4,
  children: {
    kind: 'burst',
    count: 24,
    radius: [0, rand(40, 70)],
    children: {
      kind: 'circle',
      radius: [rand(1.5, 3.5), 0],
      fill: each(colors),
      duration: rand(0.9, 1.5),
    },
  },
});

const [first, second, third] = gsap.utils.toArray('.rocket');
// The section is the container: bursts scroll with it and are clipped by it.
const inSky = { container: '.sky' };

gsap
  .timeline({
    scrollTrigger: { trigger: '.sky', start: 'top top', end: '+=2500', scrub: 1, pin: true },
  })
  // Each rocket rises, then its shell opens where it stopped as the rocket fades.
  .to(first, { y: '-65vh', duration: 1, ease: 'power2.out' })
  .burst(first, { spec: shell(['gold', 'orangered']), ...inSky })
  .to(first, { opacity: 0, duration: 0.2 }, '<')
  .to(second, { y: '-75vh', duration: 1, ease: 'power2.out' }, '<0.3')
  .burst(second, { spec: shell(['deepskyblue', 'white']), ...inSky })
  .to(second, { opacity: 0, duration: 0.2 }, '<')
  .to(third, { y: '-55vh', duration: 1, ease: 'power2.out' }, '<0.2')
  .burst(third, { spec: shell(['deeppink', 'mediumpurple', 'gold']), ...inSky })
  .to(third, { opacity: 0, duration: 0.2 }, '<');
