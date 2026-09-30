import { Burst } from '@motly/core';
import { CanvasRenderer } from '@motly/core/canvas';
import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(Motly, ScrollTrigger);

// The model: the radiant's altitude and azimuth for a site at 50° N on the peak night, and the
// hourly rate ZHR 100 × sin(altitude) that follows from it. Local solar time.
const hours = [
  { time: '21:00', altitude: 25, azimuth: 26, rate: 42 },
  { time: '22:00', altitude: 30, azimuth: 33, rate: 50 },
  { time: '23:00', altitude: 36, azimuth: 40, rate: 58 },
  { time: '00:00', altitude: 42, azimuth: 45, rate: 67 },
  { time: '01:00', altitude: 49, azimuth: 50, rate: 76 },
  { time: '02:00', altitude: 57, azimuth: 54, rate: 84 },
  { time: '03:00', altitude: 65, azimuth: 56, rate: 91 },
  { time: '04:00', altitude: 73, azimuth: 52, rate: 95 },
];

const sky = document.querySelector('.sky');
const radiant = document.querySelector('.radiant');
const flash = document.querySelector('.flash');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Lengths scale with the sky, so the story reads the same on a phone and a monitor.
const unit = Math.min(innerWidth, innerHeight) / 600;

// Looking north-east: azimuth 45° is the middle of the view, the horizon is 82% down.
const place = ({ altitude, azimuth }) => ({
  left: `${50 + ((azimuth - 45) / 45) * 40}%`,
  top: `${82 - (altitude / 90) * 74}%`,
});

/**
 * `count` meteors thrown from the radiant between `from` and `to` pixels out, arriving at random
 * through about 2 seconds: an hour, sped up. A Burst's rays are evenly spaced from 12 o'clock and
 * a line runs from 12 to 6, so turning the ith streak by the ith ray's angle points it along its
 * ray. `scale` sizes the distances; `size`, the streaks themselves.
 */
const streaks = (count, from, to, length, scale = unit, size = scale) => ({
  kind: 'burst',
  count,
  radius: [from * scale, to * scale],
  restAt: 0.5,
  children: {
    kind: 'line',
    angle: each(Array.from({ length: count }, (_, i) => (360 * i) / count)),
    radius: [2 * size, rand(length * 0.6 * size, length * size), 0],
    stroke: ['#ffffff', '#bfe3ff'],
    strokeWidth: [0.6 * size, rand(1.4 * size, 2.6 * size), 0],
    opacity: [0, 1, 0],
    delay: rand(0, 2.2),
    duration: rand(0.35, 0.6),
  },
});

/**
 * One hour's meteors, split near, mid and far. The three Bursts have different counts, so their
 * rays do not line up and the streaks look scattered. The first two hours add earthgrazers: long,
 * slow meteors skimming the sky while the radiant is low.
 */
const shower = (index, scale = unit, size = scale) => {
  const { rate } = hours[index];
  const near = Math.round(rate * 0.3);
  const mid = Math.round(rate * 0.4);
  const parts = [
    streaks(near, 20, 150, 22, scale, size),
    streaks(mid, 120, 320, 30, scale, size),
    streaks(rate - near - mid, 260, 540, 38, scale, size),
  ];
  if (index < 2) {
    const grazers = streaks(4, 200, 900, 80, scale, size);
    parts.push({ ...grazers, children: { ...grazers.children, duration: rand(1.2, 1.6) } });
  }
  return parts;
};

// One Seed per hour, part and replay: the same hour always rains the same meteors.
const seed = (index, loop, part) => index * 1000 + loop * 10 + part;

// The sky: about 560 stars in three levels of Bursts, spread around the middle of the sky. Each
// twinkles through its own random opacities, back and forth for as long as the page is open.
const starField = {
  kind: 'burst',
  count: 10,
  radius: 200 * unit,
  restAt: 0.5,
  children: {
    kind: 'burst',
    count: 8,
    radius: rand(20 * unit, 330 * unit),
    children: {
      kind: 'burst',
      count: 7,
      radius: rand(8 * unit, 120 * unit),
      children: {
        kind: 'circle',
        radius: rand(0.4, 1.3),
        fill: each(['#ffffff', '#cfe0ff', '#fff2d6']),
        opacity: [rand(0.2, 0.9), rand(0.3, 1), rand(0.2, 0.9), rand(0.3, 1)],
        duration: rand(3, 6),
      },
    },
  },
};
gsap.effects.burst(sky, {
  spec: starField,
  container: '.stars',
  renderer: 'canvas',
  seed: 12,
  repeat: -1,
  yoyo: true,
});

// The rain for the hour on the clock plays live, replay after replay, each with the next Seed.
// Under reduced motion it holds one Resting frame instead.
let rain;
function rainFor(index, loop = 0) {
  rain?.revert();
  rain = gsap.timeline({
    repeat: reduceMotion ? -1 : 0,
    onComplete: () => rainFor(index, loop + 1),
  });
  shower(index).forEach((spec, part) => {
    const vars = { spec, container: '.rain', renderer: 'canvas', seed: seed(index, loop, part) };
    // The radiant is an Anchor: each Burst starts from wherever it has climbed to by now.
    rain.burst(radiant, vars, 0);
  });
}

// A fireball at 23:40, scrubbed with the story: it flies up from the radiant, flashes and
// breaks apart where it ends, and scrolling back runs it back exactly. A Burst of one throws
// straight up, so it comes while the radiant is still low enough to leave it room.
const tail = 34 * unit;
const fireball = {
  kind: 'burst',
  count: 1,
  radius: [40 * unit, 250 * unit - tail],
  restAt: 0.8,
  children: {
    kind: 'line',
    radius: tail,
    stroke: ['#ff7b00', '#ffd166', '#ff7b00'],
    strokeWidth: [1 * unit, 2.5 * unit, 1.5 * unit],
    opacity: [0, 0.9, 0.7],
    duration: 0.9,
  },
};
// Its head: the same throw, a tail's length further out, so it leads the streak.
const head = {
  ...fireball,
  radius: [40 * unit + tail, 250 * unit],
  children: {
    kind: 'circle',
    radius: [1.5 * unit, 4 * unit, 3 * unit],
    fill: ['#ffffff', '#fff7d6'],
    opacity: [0, 1, 1],
    duration: 0.9,
  },
};
const burn = {
  kind: 'circle',
  radius: [0, 60 * unit],
  fill: 'none',
  stroke: '#fff7d6',
  strokeWidth: [4 * unit, 0],
  duration: 0.5,
  restAt: 0.3,
};
const fragments = {
  kind: 'burst',
  count: 22,
  radius: [0, rand(30 * unit, 80 * unit)],
  easing: 'ease-out',
  restAt: 0.4,
  children: {
    kind: 'swirl',
    size: rand(20, 50),
    direction: each([1, -1]),
    child: {
      kind: 'circle',
      radius: [rand(1.5 * unit, 3 * unit), 0],
      fill: ['#fff7d6', '#ffd166', '#ef476f'],
      duration: rand(0.7, 1.1),
    },
  },
};
flash.style.setProperty('--throw', `${250 * unit}px`);

// The story: one timeline, one unit per hour, scrubbed by scrolling through the pinned sky.
const story = gsap.timeline({
  defaults: { ease: 'none' },
  scrollTrigger: { trigger: sky, start: 'top top', end: '+=900%', pin: true, scrub: 0.6 },
  onUpdate: () => show(story.time()),
});
gsap.set(radiant, place(hours[0]));
story
  .to(radiant, { keyframes: hours.slice(1).map((hour) => ({ ...place(hour), duration: 1 })) }, 0)
  .to('.night', { opacity: 1, duration: 1.2 }, 0)
  .fromTo('.stars', { opacity: 0.15 }, { opacity: 1, duration: 1.2 }, 0)
  .burst(radiant, { spec: fireball, container: '.rain', seed: 812, duration: 0.25 }, 2.6)
  .burst(radiant, { spec: head, container: '.rain', seed: 812, duration: 0.25 }, 2.6)
  .shape(flash, { spec: burn, container: '.rain', duration: 0.3 }, 2.85)
  .burst(flash, { spec: fragments, container: '.rain', seed: 813, duration: 0.5 }, 2.85)
  .to('.dawn', { opacity: 1, duration: 1 }, 7)
  .to('.stars', { opacity: 0, duration: 0.8 }, 7.2)
  .to('.rain', { opacity: 0.3, duration: 0.8 }, 7.2);

// Each caption fades in at its beat and out before the next.
const beats = [0, 1.1, 2.5, 3.4, 6.4, 7.5];
gsap.utils.toArray('.captions p').forEach((caption, i) => {
  story.fromTo(caption, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.2 }, beats[i]);
  if (i < beats.length - 1) story.to(caption, { autoAlpha: 0, duration: 0.2 }, beats[i + 1] - 0.3);
});

// The clock, the running count and the bar chart follow the timeline.
const clock = document.querySelector('.clock');
const count = document.querySelector('.count strong');
const bars = hours.map(({ time, rate }) => {
  const bar = document.createElement('li');
  bar.style.setProperty('--rate', rate);
  bar.title = `${time}: ${rate} an hour`;
  return bar;
});
document.querySelector('.rates').append(...bars);

let hour;
function show(t) {
  const index = Math.min(hours.length - 1, Math.floor(t));
  const minutes = Math.round(t * 60);
  const hh = String((21 + Math.floor(minutes / 60)) % 24).padStart(2, '0');
  clock.textContent = `${hh}:${String(minutes % 60).padStart(2, '0')}`;
  const seen = hours.reduce((sum, { rate }, i) => sum + rate * Math.min(1, Math.max(0, t - i)), 0);
  count.textContent = String(Math.round(seen));
  if (index !== hour) {
    bars[hour]?.classList.remove('now');
    bars[index].classList.add('now');
    hour = index;
    rainFor(index);
  }
}
show(0);

// The epilogue: every hour's first replay, still, at its Resting frame, drawn by core alone.
const tiles = document.querySelector('.tiles');
hours.forEach((entry, index) => {
  const figure = document.createElement('figure');
  const canvas = document.createElement('canvas');
  const caption = document.createElement('figcaption');
  caption.textContent = `${entry.time} · ${entry.rate}/h`;
  figure.append(canvas, caption);
  tiles.append(figure);

  const renderer = new CanvasRenderer(canvas);
  const { width, height } = canvas.getBoundingClientRect();
  const { left, top } = place(entry);
  const origin = { x: (parseFloat(left) / 100) * width, y: (parseFloat(top) / 100) * height };
  const scale = width / 600;
  // Distances shrink with the tile; the streaks shrink less, so they still show.
  shower(index, scale, scale * 2.5).forEach((spec, part) => {
    const binding = { renderer, origin, seed: seed(index, 0, part), reducedMotion: 'always' };
    new Burst(spec, binding).play();
  });
});
