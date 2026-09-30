import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(Motly, ScrollTrigger);

// Fireworks behind a number: bursts of bursts, in the section's own color.
const fireworks = (tone) => ({
  kind: 'burst',
  count: 7,
  radius: [0, rand(110, 150)],
  easing: 'ease-out',
  restAt: 0.45,
  children: {
    kind: 'burst',
    count: 10,
    radius: [0, rand(25, 45)],
    delay: rand(0, 0.2),
    children: {
      kind: 'circle',
      radius: [rand(3, 5.5), 0],
      fill: each([tone, '#ffffff']),
      duration: rand(0.7, 1.1),
    },
  },
});

gsap.utils.toArray('.stat').forEach((section, index) => {
  const number = section.querySelector('strong');
  const tone = getComputedStyle(section).getPropertyValue('--tone').trim();
  const counter = { value: 0 };

  gsap
    .timeline({
      // Scrubbed: the scroll position is the Playhead, forward and back.
      scrollTrigger: { trigger: section, start: 'top 70%', end: 'center 40%', scrub: 0.5 },
    })
    .to(counter, {
      value: Number(number.dataset.to),
      duration: 1,
      ease: 'power2.out',
      onUpdate: () => {
        number.textContent = Math.round(counter.value).toLocaleString('en');
      },
    })
    // Painted inside the section, so it scrolls with it. A fixed seed per section keeps each
    // burst the same however often it is scrubbed.
    .burst(number, { spec: fireworks(tone), container: section, seed: 2026 + index }, 0.6);
});
