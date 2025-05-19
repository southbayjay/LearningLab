import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { visualizer } from 'rollup-plugin-visualizer';
import basicSsl from '@vitejs/plugin-basic-ssl';
import legacy from '@vitejs/plugin-legacy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env variables regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      basicSsl(),
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
      // Visualize bundle size in development
      mode === 'analyze' && visualizer({
        open: true,
        filename: 'bundle-analyzer.html',
      }),
    ].filter(Boolean),
    
    // Base public path when served in development or production
    base: env.VITE_BASE_URL || '/',
    
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
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    
    // Build configuration
    build: {
      outDir: '../../dist/client',
      emptyOutDir: true,
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'esbuild' : false,
      cssCodeSplit: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: [
              '@radix-ui/react-dialog', 
              '@radix-ui/react-dropdown-menu', 
              '@radix-ui/react-select',
              '@tanstack/react-query'
            ],
          },
        },
      },
      // Enable brotli compression for better loading performance
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000, // in kBs
    },
    
    // Environment variables configuration
    define: {
      'process.env': {},
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['@tanstack/react-query'],
    },
    
    // CSS configuration
    css: {
      devSourcemap: true, // Enable CSS source maps in development
      modules: {
        // Configure CSS modules
        localsConvention: 'camelCaseOnly',
      },
    },
  };
});
