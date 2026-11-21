import { defineConfig } from 'astro/config';

export default defineConfig({ site: 'https://germanbartoli.pages.dev', output: 'static', vite: { build: { assetsInlineLimit: 0 } } });
