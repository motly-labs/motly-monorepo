import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// Streaks: a line runs from 12 o'clock to 6, so without orient every one points straight up.
const streaks = (orient) => ({
  kind: 'burst',
  count: 12,
  radius: [15, 80],
  orient,
  restAt: 0.5,
  children: {
    kind: 'line',
    radius: [3, 18, 0],
    stroke: '#ffd166',
    strokeWidth: 3,
    duration: 0.8,
  },
});

const [left, right] = document.querySelectorAll('.origin');
gsap.effects.burst(left, { spec: streaks(false), repeat: -1, repeatDelay: 0.4 });
gsap.effects.burst(right, { spec: streaks(true), repeat: -1, repeatDelay: 0.4 });
