// @ts-nocheck
// Simplified Vite configuration for Vercel deployment
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  
  // Base public path when served in development or production
  base: '/',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  server: {
    port: 5173,
    host: true, // Listen on all network interfaces
    strictPort: true, // Exit if port is already in use
    open: true, // Open browser on server start
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  
  // Build configuration
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  
  // Environment variables configuration
  define: {
    'process.env': {},
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  // Optimizations for production
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: []
  },
  
  // CSS configuration
  css: {
    devSourcemap: true, // Enable CSS source maps in development
    modules: {
      // Configure CSS modules
      localsConvention: 'camelCaseOnly',
    },
  },
});
