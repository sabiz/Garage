// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://garage.sabiz.jp',
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()]
  }
});