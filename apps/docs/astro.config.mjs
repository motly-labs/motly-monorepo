import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// Served from GitHub Pages under the repo's path until motlyjs.dev is registered.
export default defineConfig({
  site: 'https://motly-labs.github.io',
  base: '/motly-monorepo',
  integrations: [
    starlight({
      title: 'motly',
      description: 'Procedural motion graphics for the web: bursts generated from a JSON Spec.',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/motly-labs/motly-monorepo' },
      ],
    }),
  ],
});
