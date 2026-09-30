import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// Served from GitHub Pages under the repo's path until motlyjs.dev is registered.
export default defineConfig({
  site: 'https://motly-labs.github.io',
  base: '/motly-monorepo',
  integrations: [
    // Only for the React example; no page renders a React component itself.
    react(),
    starlight({
      title: 'motly',
      description: 'Procedural motion graphics for the web: bursts generated from a JSON Spec.',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/motly-labs/motly-monorepo' },
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'With GSAP', slug: 'start/gsap' },
            { label: 'Without GSAP', slug: 'start/core' },
          ],
        },
        { label: 'Guides', items: [{ label: 'Using motly with GSAP', slug: 'guides/gsap' }] },
        {
          label: 'Examples',
          items: [
            { label: 'Pens and small ideas', slug: 'examples' },
            { label: 'Real-world examples', slug: 'examples/real-world' },
            { label: 'A night of the Perseids', slug: 'examples/perseids' },
            { label: 'Party night, on the beat', slug: 'examples/party-night' },
          ],
        },
        {
          label: 'Spec reference',
          items: [
            { label: 'Shapes', slug: 'reference/shapes' },
            { label: 'Burst', slug: 'reference/burst' },
            { label: 'Swirl', slug: 'reference/swirl' },
            { label: 'Values', slug: 'reference/values' },
            { label: 'Time', slug: 'reference/time' },
          ],
        },
      ],
    }),
  ],
});
