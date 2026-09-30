import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// ---- The score: one list of events that both the synth and the show read. ----

const bpm = 124;
const beat = 60 / bpm;
const bar = beat * 4;
const sixteenth = beat / 4;
const sections = [
  { name: 'Warm-up', bars: 8 },
  { name: 'Build', bars: 8 },
  { name: 'Drop', bars: 16 },
  { name: 'Break', bars: 4 },
  { name: 'Last drop', bars: 8 },
];
// One chord a bar, round and round: A minor, F, C, G, each with its color.
const chords = [
  { root: 45, notes: [57, 60, 64], color: '#ff4d8d' },
  { root: 41, notes: [57, 60, 65], color: '#8b5cf6' },
  { root: 48, notes: [55, 60, 64], color: '#22d3ee' },
  { root: 43, notes: [55, 59, 62], color: '#fbbf24' },
];

const score = [];
let n = 0;
let at = 0;
for (const section of sections) {
  section.start = at;
  const drop = section.name.endsWith('rop');
  if (drop) score.push({ type: 'crash', t: at });
  if (section.name === 'Build') score.push({ type: 'sweep', t: at, duration: section.bars * bar });
  for (let b = 0; b < section.bars; b++, n++) {
    const t0 = at + b * bar;
    const chord = chords[n % chords.length];
    score.push({ type: 'bar', t: t0, n, chord, section });
    if (section.name === 'Warm-up' || section.name === 'Break') {
      score.push({ type: 'pad', t: t0, notes: chord.notes });
    }
    for (let q = 0; q < 4; q++) {
      const t = t0 + q * beat;
      if (section.name !== 'Break') score.push({ type: 'kick', t });
      if (section.name !== 'Warm-up' && section.name !== 'Break' && q % 2 === 1) {
        score.push({ type: 'clap', t, side: q === 1 ? 'left' : 'right' });
      }
      score.push({ type: 'hat', t: t + beat / 2, open: drop });
      if (drop) {
        score.push({ type: 'hat', t: t + sixteenth, open: false });
        score.push({ type: 'hat', t: t + sixteenth * 3, open: false });
        score.push({ type: 'bass', t: t + beat / 2, root: chord.root });
        if (q % 2 === 1) score.push({ type: 'stab', t: t + beat / 2, notes: chord.notes, chord });
      }
    }
    // The last four bars of the build roll in 8ths, then 16ths, louder and bigger each step.
    if (section.name === 'Build' && b >= section.bars - 4) {
      const step = b >= section.bars - 2 ? sixteenth : beat / 2;
      for (let t = t0; t < t0 + bar - 1e-6; t += step) {
        const level = (t - (at + (section.bars - 4) * bar)) / (4 * bar);
        score.push({ type: 'roll', t, level });
      }
    }
  }
  at += section.bars * bar;
}
score.push({ type: 'finale', t: at });
score.sort((a, b) => a.t - b.t);
const length = at + bar;

// ---- The synth: each event made from oscillators and noise, a moment before it is due. ----

const context = new AudioContext();
const limiter = context.createDynamicsCompressor();
limiter.connect(context.destination);
const noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
const samples = noise.getChannelData(0);
for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
// Each play gets its own bus; pausing disconnects it, silencing whatever it had queued.
let bus;

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const envelope = (t, peak, decay) => {
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  gain.connect(bus);
  return gain;
};
const filter = (type, frequency, into, q = 1) => {
  const node = context.createBiquadFilter();
  node.type = type;
  node.frequency.value = frequency;
  node.Q.value = q;
  node.connect(into);
  return node;
};
const tone = (type, frequency, t, duration, into) => {
  const osc = context.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t);
  osc.connect(into);
  osc.start(t);
  osc.stop(t + duration);
  return osc;
};
const hiss = (t, duration, into) => {
  const source = context.createBufferSource();
  source.buffer = noise;
  source.loop = true;
  source.connect(into);
  source.start(t);
  source.stop(t + duration);
};

// Each instrument takes the event and `t`, the audio clock's time it is due at.
const instruments = {
  kick: (_, t) => {
    const osc = tone('sine', 150, t, 0.5, envelope(t, 1, 0.45));
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  },
  hat: ({ open }, t) =>
    hiss(t, 0.3, filter('highpass', 7000, envelope(t, 0.16, open ? 0.2 : 0.05))),
  clap: (_, t) => hiss(t, 0.3, filter('bandpass', 1300, envelope(t, 0.7, 0.2), 1.2)),
  roll: ({ level }, t) =>
    hiss(t, 0.15, filter('bandpass', 1800, envelope(t, 0.1 + 0.5 * level, 0.09))),
  bass: ({ root }, t) =>
    tone('sawtooth', hz(root), t, beat / 2, filter('lowpass', 420, envelope(t, 0.45, beat * 0.45))),
  stab: ({ notes }, t) => {
    const out = filter('lowpass', 2400, envelope(t, 0.2, 0.3));
    for (const note of notes) {
      tone('sawtooth', hz(note) * 1.004, t, 0.35, out);
      tone('square', hz(note), t, 0.35, out);
    }
  },
  pad: ({ notes }, t) => {
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.5);
    gain.gain.linearRampToValueAtTime(0.0001, t + bar);
    gain.connect(bus);
    for (const note of notes) tone('triangle', hz(note), t, bar, gain);
  },
  sweep: ({ duration }, t) => {
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + duration);
    gain.connect(bus);
    const rise = filter('highpass', 300, gain);
    rise.frequency.setValueAtTime(300, t);
    rise.frequency.exponentialRampToValueAtTime(8000, t + duration);
    hiss(t, duration, rise);
  },
  crash: (_, t) => hiss(t, 2.5, filter('highpass', 4500, envelope(t, 0.3, 2.2))),
  finale: (_, t) => hiss(t, 2.5, filter('highpass', 4500, envelope(t, 0.35, 2.4))),
};

// ---- The show: a paused GSAP timeline with a burst for each event, placed at its time. ----

const stage = document.querySelector('.stage');
const fixtures = gsap.utils.toArray('.fixture');
const unit = Math.min(stage.clientWidth, stage.clientHeight) / 600;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const u = (value) => value * unit;

const ring = (color) => ({
  kind: 'circle',
  radius: [u(20), u(170)],
  fill: 'none',
  stroke: color,
  strokeWidth: [u(10), 0],
  opacity: [0.8, 0],
  duration: 0.5,
  restAt: 0.2,
});
const clap = (color) => ({
  kind: 'burst',
  count: 10,
  radius: [u(10), u(70)],
  restAt: 0.3,
  children: {
    kind: 'star',
    points: 4,
    innerRadius: 0.35,
    radius: [rand(u(4), u(9)), 0],
    fill: each([color, '#ffffff']),
    duration: 0.45,
  },
});
const spark = {
  kind: 'burst',
  count: 6,
  radius: [0, u(22)],
  restAt: 0.3,
  children: { kind: 'circle', radius: [rand(u(1), u(2.5)), 0], fill: '#ffffff', duration: 0.25 },
};
const stab = (color) => ({
  kind: 'burst',
  count: 8,
  radius: [u(40), u(130)],
  easing: 'ease-out',
  restAt: 0.3,
  children: {
    kind: 'polygon',
    points: each([3, 4]),
    radius: [rand(u(5), u(10)), 0],
    angle: [0, rand(-90, 90)],
    fill: color,
    duration: 0.4,
  },
});
// The build's roll, from a whisper to a wall: more Children, further out, bigger, each step.
const riser = (level) => ({
  kind: 'burst',
  count: 6 + Math.round(level * 18),
  radius: [0, u(40 + level * 140)],
  restAt: 0.4,
  children: {
    kind: 'swirl',
    size: 25,
    direction: each([1, -1]),
    child: { kind: 'circle', radius: [u(2 + level * 3), 0], fill: '#ffffff', duration: 0.35 },
  },
});
// Confetti in clumps: 20 bursts of 8, so the pieces scatter instead of forming one ring.
const confetti = (color) => {
  // Each piece holds its size for most of its fall, then shrinks away.
  const piece = {
    fill: each([color, '#ffffff', '#fbbf24', '#22d3ee']),
    angle: [0, rand(-360, 360)],
    scale: [1, 1, 0],
    duration: rand(1.8, 2.6),
  };
  return {
    kind: 'burst',
    count: 20,
    radius: [0, u(260)],
    easing: 'ease-out',
    restAt: 0.3,
    children: {
      kind: 'burst',
      count: 8,
      radius: [0, rand(u(30), u(150))],
      delay: rand(0, 0.15),
      children: each([
        { kind: 'star', points: 5, radius: rand(u(4), u(8)), ...piece },
        { kind: 'polygon', points: 4, radius: rand(u(3), u(6)), ...piece },
        { kind: 'circle', radius: rand(u(2), u(4)), ...piece },
      ]),
    },
  };
};
const shell = (color) => ({
  kind: 'burst',
  count: 12,
  radius: [0, u(90)],
  restAt: 0.4,
  children: {
    kind: 'burst',
    count: 12,
    radius: [0, rand(u(40), u(80))],
    children: {
      kind: 'circle',
      radius: [rand(u(1.5), u(3)), 0],
      fill: each([color, '#ffffff']),
      duration: rand(0.9, 1.4),
    },
  },
});
const twinkle = {
  kind: 'burst',
  count: 5,
  radius: [0, rand(u(20), u(60))],
  restAt: 0.5,
  children: {
    kind: 'star',
    points: 4,
    innerRadius: 0.3,
    radius: [0, rand(u(3), u(6)), 0],
    fill: '#ffffff',
    delay: rand(0, 0.6),
    duration: rand(1.2, 2),
  },
};

const show = gsap.timeline({ paused: true });
const inStage = { container: stage };
const sky = () => ({ x: stage.clientWidth / 2, y: stage.clientHeight * 0.3 });
let seed = 0;
const fire = (target, spec, t, vars = {}) =>
  show.burst(target, { spec, ...inStage, seed: seed++, ...vars }, t);

for (const event of score) {
  const { t } = event;
  if (event.type === 'bar') {
    show.set(stage, { '--tone': event.chord.color }, t);
    const swing = event.n % 2 ? 22 : -22;
    const drop = event.section.name.endsWith('rop');
    if (!calm && event.section.name !== 'Break') {
      show.to(
        '.beam',
        {
          rotate: (i) => (i % 2 ? swing : -swing) * (drop ? 1 : 0.4),
          duration: bar,
          ease: 'sine.inOut',
        },
        t,
      );
    }
    if (calm && t === event.section.start) {
      // Under reduced motion: one still burst for the whole section, and nothing on the beat.
      const spec = { ...stab(event.chord.color), count: 12 };
      fire('.booth', spec, t, { duration: event.section.bars * bar });
    }
    if (!calm && event.section.name === 'Break') fire(fixtures[event.n % 6], twinkle, t);
    continue;
  }
  if (calm) continue;
  if (event.type === 'kick') show.shape('.booth', { spec: ring(chordAt(t).color), ...inStage }, t);
  if (event.type === 'clap') fire(`.speaker.${event.side}`, clap(chordAt(t).color), t);
  if (event.type === 'hat') fire(fixtures[Math.round(t / sixteenth) % 6], spark, t);
  if (event.type === 'stab') fire('.booth', stab(event.chord.color), t);
  if (event.type === 'roll') fire('.booth', riser(event.level), t);
  if (event.type === 'crash') {
    fire('.speaker.left', confetti(chordAt(t).color), t, { renderer: 'canvas' });
    fire('.speaker.right', confetti(chordAt(t).color), t, { renderer: 'canvas' });
    fire(sky(), shell(chordAt(t).color), t + beat);
  }
  if (event.type === 'finale') {
    fire(sky(), shell('#ffffff'), t);
    fire('.booth', confetti('#ff4d8d'), t, { renderer: 'canvas' });
  }
}
show.set({}, {}, length);

function chordAt(t) {
  return chords[Math.floor(t / bar) % chords.length];
}

// ---- Time: the audio clock decides it. Each frame, the show is moved to where the music is. ----

const playButton = document.querySelector('.play');
const seek = document.querySelector('.seek');
const sectionName = document.querySelector('.section');
const position = document.querySelector('.position');
seek.max = String(length);

let playing = false;
let startedAt = 0;
let offset = 0;
let cursor = 0;
let timer;

const heard = () => (playing ? Math.max(0, context.currentTime - startedAt + offset) : offset);
// What is on screen trails the audio clock by the time the sound takes to reach the speakers.
const seen = () =>
  Math.max(0, heard() - (playing ? context.outputLatency || context.baseLatency : 0));

// Every 25 ms, synthesize whatever falls due in the next quarter second.
function schedule() {
  const horizon = heard() + 0.25;
  while (cursor < score.length && score[cursor].t < horizon) {
    const event = score[cursor++];
    instruments[event.type]?.(event, startedAt + event.t - offset);
  }
}

function play() {
  context.resume();
  bus = context.createGain();
  bus.gain.value = 0.7;
  bus.connect(limiter);
  startedAt = context.currentTime + 0.05;
  cursor = score.findIndex((event) => event.t >= offset);
  if (cursor < 0) cursor = score.length;
  playing = true;
  schedule();
  timer = setInterval(schedule, 25);
  playButton.textContent = 'Pause';
  playButton.setAttribute('aria-pressed', 'true');
}

function pause() {
  offset = heard();
  playing = false;
  clearInterval(timer);
  bus.disconnect();
  playButton.textContent = 'Play';
  playButton.setAttribute('aria-pressed', 'false');
}

function render(t) {
  show.time(t);
  seek.value = String(t);
  const section = sections.findLast((entry) => entry.start <= t) ?? sections[0];
  sectionName.textContent = section.name;
  const beats = Math.floor(t / beat);
  position.textContent = `bar ${Math.floor(beats / 4) + 1} · beat ${(beats % 4) + 1}`;
}

gsap.ticker.add(() => {
  if (!playing) return;
  if (heard() >= length) {
    pause();
    offset = 0;
    playButton.textContent = 'Play again';
  }
  render(Math.min(seen(), length));
});

playButton.addEventListener('click', () => (playing ? pause() : play()));
seek.addEventListener('input', () => {
  const resume = playing;
  if (resume) pause();
  offset = seek.valueAsNumber;
  render(offset);
  if (resume) play();
});

render(0);
