import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
    },
  },
  server: {
    port: 5173,                     // ✅ MUST use this port in your browser
    host: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      '/api/auth': { target: 'http://localhost:8001', changeOrigin: true, ws: true },
      '/api/dashboard': { target: 'http://localhost:8001', changeOrigin: true, ws: true },   // ✅ new rule
      '/api': { target: 'http://localhost:8000', changeOrigin: true, ws: true },
      '/dashboard': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/dashboard/, '/api/dashboard')
      }
    }
  },
});