// vite.config.js
import {resolve} from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        laskuri: resolve(__dirname, 'laskuri.html'),
        diary: resolve(__dirname, 'diary.html'),
        peli: resolve(__dirname, 'peli.html'),
        apitest: resolve(__dirname, 'src/pages/apitest.html'),
        authtest: resolve(__dirname, 'src/pages/authtest.html'),
      },
    },
  },
  base: './',
});