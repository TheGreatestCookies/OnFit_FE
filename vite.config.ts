import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwind from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwind()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    define: {
      global: 'window',
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (pathName) => pathName.replace(/^\/api/, '/api'),
        },
        '/s3': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/aws-s3': {
          target: 'https://s3-test-yunjae.s3.ap-northeast-2.amazonaws.com',
          changeOrigin: true,
          secure: false,
          rewrite: (pathName) => pathName.replace(/^\/aws-s3/, ''),
        },
      },
    },
  };
});
