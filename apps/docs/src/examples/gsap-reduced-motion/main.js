import { Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const spec = {
  kind: 'burst',
  count: 12,
  radius: [0, 80],
  // The Resting frame: what a viewer who prefers reduced motion sees, for the whole tween.
  restAt: 0.4,
  children: { kind: 'circle', radius: [rand(4, 9), 0], fill: 'gold', duration: 1.2 },
};

// Left out, reducedMotion follows the viewer's setting. These force it, as a demo or test would.
for (const button of document.querySelectorAll('button')) {
  button.addEventListener('click', () => {
    gsap.effects.burst(button, { spec, reducedMotion: button.dataset.reducedMotion });
  });
}
