import { createScope, each, rand } from '@motly/core';
import { SVGRenderer } from '@motly/core/svg';

const renderer = new SVGRenderer(document.querySelector('svg'));
const scope = createScope();
const timeline = scope.timeline();

const ring = {
  kind: 'circle',
  radius: [0, 50],
  fill: 'none',
  stroke: '#ffd166',
  strokeWidth: [10, 0],
  duration: 0.6,
};
const sparks = {
  kind: 'burst',
  count: 10,
  radius: [0, 60],
  children: {
    kind: 'circle',
    radius: [rand(3, 7), 0],
    fill: each(['#ef476f', '#06d6a0']),
    duration: 0.7,
  },
};

// Left out, `at` places an Instance after everything so far; given, it overlaps at that second.
timeline.shape(ring, { renderer, origin: { x: 80, y: 110 } });
timeline.burst(sparks, { renderer, origin: { x: 210, y: 110 } });
timeline.burst(sparks, { renderer, origin: { x: 340, y: 110 } }, 0.8);

timeline.play();
