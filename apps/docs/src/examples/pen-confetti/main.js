import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const palette = ['deeppink', 'gold', 'cyan', 'mediumpurple', 'limegreen'];
const piece = { fill: each(palette), stroke: each(palette), duration: rand(0.9, 1.5) };

/** Confetti thrown `reach` pixels out: stars, squares, dots and streamers. */
const confetti = (count, reach) => ({
  kind: 'burst',
  count,
  radius: [0, reach],
  easing: 'ease-out',
  restAt: 0.35,
  children: each([
    { kind: 'star', points: 5, radius: [rand(6, 12), 0], angle: [0, rand(-270, 270)], ...piece },
    { kind: 'polygon', points: 4, radius: [rand(4, 9), 0], angle: [0, rand(-180, 180)], ...piece },
    { kind: 'circle', radius: [rand(3, 7), 0], ...piece },
    { kind: 'line', radius: [rand(5, 10), 0], angle: [0, rand(-360, 360)], ...piece },
  ]),
});

const button = document.querySelector('.celebrate');

button.addEventListener('click', () => {
  // Points are viewport pixels, read when the click happens.
  const left = { x: innerWidth * 0.15, y: innerHeight * 0.3 };
  const right = { x: innerWidth * 0.85, y: innerHeight * 0.3 };
  gsap
    .timeline()
    .to(button, { scale: 0.92, duration: 0.1, yoyo: true, repeat: 1 })
    .burst(button, { spec: confetti(28, 140) }, '<')
    // 0.25 s after the button's burst starts, both sides at once.
    .burst(left, { spec: confetti(40, 220) }, '<0.25')
    .burst(right, { spec: confetti(40, 220) }, '<');
});
