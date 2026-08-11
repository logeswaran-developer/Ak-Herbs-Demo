import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// AK Herbs frontend — dev server proxies /api calls to the Express backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
