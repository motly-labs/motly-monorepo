import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// What lands on the cart: a ring, and a pop of confetti in the product's color.
const ring = {
  kind: 'circle',
  radius: [10, 34],
  fill: 'none',
  stroke: '#1d1b26',
  strokeWidth: [4, 0],
  duration: 0.45,
  restAt: 0.3,
};
const pop = (tone) => ({
  kind: 'burst',
  count: 12,
  radius: [10, rand(38, 50)],
  easing: 'ease-out',
  restAt: 0.35,
  children: {
    kind: 'star',
    points: 4,
    innerRadius: 0.4,
    radius: [rand(3, 6), 0],
    angle: [0, rand(-120, 120)],
    fill: each([tone, '#1d1b26']),
    duration: rand(0.45, 0.7),
  },
});

const cart = document.querySelector('.cart');
const badge = cart.querySelector('.badge');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let count = 0;

for (const button of document.querySelectorAll('.add')) {
  button.addEventListener('click', () => {
    const image = button.closest('.product').querySelector('.image');
    const tone = getComputedStyle(image).getPropertyValue('--tone').trim();

    // A copy of the product image flies to the cart; the page itself does not move.
    const from = image.getBoundingClientRect();
    const to = cart.getBoundingClientRect();
    const flyer = image.cloneNode(true);
    flyer.classList.add('flyer');
    Object.assign(flyer.style, {
      left: `${from.left}px`,
      top: `${from.top}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
    });
    document.body.append(flyer);

    // The flight is GSAP's; under reduced motion it jumps straight to the cart.
    const flight = reduceMotion.matches ? 0 : 0.7;
    const x = to.left + to.width / 2 - (from.left + from.width / 2);
    const y = to.top + to.height / 2 - (from.top + from.height / 2);

    gsap
      .timeline()
      .to(button, { scale: 0.95, duration: 0.08, yoyo: true, repeat: 1 })
      // x and y on different eases make the path an arc.
      .to(flyer, { x, duration: flight, ease: 'power1.inOut' }, 0)
      .to(flyer, { y, duration: flight, ease: 'back.in(1.4)' }, 0)
      .to(flyer, { scale: 0.12, borderRadius: '50%', duration: flight, ease: 'power2.in' }, 0)
      .call(() => flyer.remove())
      // The cart's position is read when its bursts start, not when the timeline was built.
      .shape(cart, { spec: ring })
      .burst(cart, { spec: pop(tone) }, '<')
      .call(
        () => {
          count += 1;
          badge.textContent = String(count);
          cart.setAttribute('aria-label', `Cart, ${count} ${count === 1 ? 'item' : 'items'}`);
        },
        [],
        '<',
      )
      .fromTo(badge, { scale: 1.7 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, '<');
  });
}
