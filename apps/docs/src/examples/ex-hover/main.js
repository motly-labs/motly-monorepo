import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const sparkle = {
  kind: 'burst',
  count: 8,
  radius: [40, rand(90, 120)],
  restAt: 0.3,
  children: {
    kind: 'star',
    points: 4,
    innerRadius: 0.3,
    radius: [rand(4, 8), 0],
    fill: each(['#ffd60a', '#ffffff']),
    duration: rand(0.5, 0.8),
  },
};

const card = document.querySelector('.card');
let hover;

function sparkleCard() {
  // One sparkle at a time: a new hover replaces the last one instead of piling up.
  hover?.revert();
  hover = gsap.effects.burst(card, { spec: sparkle });
}

card.addEventListener('pointerenter', sparkleCard);
card.addEventListener('focus', sparkleCard);
