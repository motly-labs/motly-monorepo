import { bounceOut, cubicOut, Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// A Burst of one Child throws it straight up, so the Burst's easing is the dot's path in time.
const curves = ['linear', cubicOut, [0.7, -0.4, 0.3, 1.4], bounceOut];

document.querySelectorAll('.origin').forEach((origin, index) => {
  const spec = {
    kind: 'burst',
    count: 1,
    radius: [0, 150],
    easing: curves[index],
    restAt: 1,
    children: { kind: 'circle', radius: 8, fill: '#ffd166', duration: 1.2 },
  };
  gsap.effects.burst(origin, { spec, repeat: -1, repeatDelay: 0.5 });
});
