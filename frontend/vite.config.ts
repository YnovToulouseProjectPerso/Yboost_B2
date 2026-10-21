import { env } from 'node:process';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': env.API_PROXY_TARGET || 'http://localhost:3000',
    },
  },
});
