import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'react-hot-toast', 'lucide-react'],
          'vendor-editor': ['@tiptap/react', '@tiptap/starter-kit'],
          'vendor-markdown': ['react-markdown'],
          'vendor-state': ['zustand', 'axios'],
        },
      },
    },
  },
});
