import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const palette = ['#ffd166', '#06d6a0', '#ef476f', '#118ab2'];

// A small burst from a checkbox as its task is done.
const tick = {
  kind: 'burst',
  count: 8,
  radius: [6, 26],
  restAt: 0.4,
  children: { kind: 'circle', radius: [rand(2, 3.5), 0], fill: '#06d6a0', duration: 0.45 },
};

// A Spec is plain data, so it can be built from the progress: each milestone is bigger.
// All done gets stars; a circle takes no `points`, so the piece is chosen first.
const milestone = (level) => ({
  kind: 'burst',
  count: 6 + level * 6,
  radius: [20, 40 + level * 30],
  easing: 'ease-out',
  restAt: 0.35,
  children: {
    ...(level === 3 ? { kind: 'star', points: 5 } : { kind: 'circle' }),
    radius: [rand(3, 3 + level * 2), 0],
    angle: [0, rand(-180, 180)],
    fill: each(palette),
    duration: rand(0.6, 0.6 + level * 0.3),
  },
});

const boxes = [...document.querySelectorAll('li input')];
const still = document.querySelector('.still input');
const value = document.querySelector('.value');
const count = document.querySelector('.count');
const status = document.querySelector('.status');
const ticks = new Map();
let reached = 0;

// Left out, reducedMotion follows the viewer's setting; the switch forces still frames.
const reducedMotion = () => (still.checked ? 'always' : 'user');

for (const box of boxes) {
  box.addEventListener('change', () => {
    if (box.checked) {
      ticks.set(box, gsap.effects.burst(box, { spec: tick, reducedMotion: reducedMotion() }));
    } else {
      // Unchecking plays the task's burst backward, back into its checkbox.
      ticks.get(box)?.reverse();
    }
    update();
  });
}

function update() {
  const done = boxes.filter((box) => box.checked).length;
  const progress = done / boxes.length;
  count.textContent = `${done}/${boxes.length}`;
  gsap.to(value, { strokeDashoffset: 264 * (1 - progress), duration: 0.5, ease: 'power2.out' });

  // A burst from the ring at a third, two thirds and all done; only on the way up.
  const level = Math.floor(progress * 3);
  if (level > reached) {
    gsap.effects.burst('.progress', {
      spec: milestone(level),
      delay: 0.3,
      reducedMotion: reducedMotion(),
    });
  }
  reached = level;
  status.textContent =
    level === 3 ? 'All done. Nice.' : level > 0 ? 'Keep going.' : 'Six small things.';
}
