import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// When deployed on Railway, VITE_API_URL is set to the backend's public URL.
// For local development it falls back to localhost:5001.
// The proxy is only active during `vite dev` — production builds use VITE_API_URL directly.
const backendUrl = process.env.VITE_API_URL || 'http://localhost:5001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: false,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
