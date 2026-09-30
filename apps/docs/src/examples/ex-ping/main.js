import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const ping = {
  kind: 'circle',
  radius: [20, 60],
  fill: 'none',
  stroke: '#ef476f',
  strokeWidth: [6, 0],
  duration: 1,
  restAt: 0.2,
};

// An unread notification pings until it is read.
const pinging = gsap.effects.shape('.bell', { spec: ping, repeat: -1, repeatDelay: 0.6 });

document.querySelector('button').addEventListener('click', (event) => {
  // revert() clears the ring mid-flight; the tween leaves nothing drawn.
  pinging.revert();
  event.currentTarget.disabled = true;
  event.currentTarget.textContent = 'All read';
});
