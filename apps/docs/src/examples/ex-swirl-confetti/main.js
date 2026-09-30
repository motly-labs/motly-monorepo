import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const palette = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2'];
const piece = { fill: each(palette), angle: [0, rand(-360, 360)], duration: rand(0.9, 1.4) };

// Each piece is wrapped in a Swirl, so it wriggles outward; neighbours curl opposite ways.
const swirl = (child) => ({
  kind: 'swirl',
  size: rand(20, 40),
  frequency: rand(1, 2),
  direction: each([1, -1]),
  child,
});

const spec = {
  kind: 'burst',
  count: 24,
  radius: [0, rand(120, 160)],
  easing: 'ease-out',
  restAt: 0.35,
  // A Swirl's child is one Spec, so each() hands out whole Swirls, one per kind of piece.
  children: each([
    swirl({ kind: 'polygon', points: 4, radius: [rand(4, 7), 0], ...piece }),
    swirl({ kind: 'star', points: 5, radius: [rand(5, 9), 0], ...piece }),
    swirl({ kind: 'circle', radius: [rand(3, 5), 0], ...piece }),
  ]),
};

const button = document.querySelector('button');
button.addEventListener('click', () => gsap.effects.burst(button, { spec }));
