import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // PERF-6: split large vendor trees into their own chunks so the
        // unauthenticated Login/Register bundle stays lean, and the date-pickers
        // adapter only loads with the pages that use it.
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@mui/x-date-pickers')) return 'mui-x-date-pickers';
            if (id.includes('@mui/material') || id.includes('@mui/icons-material')) return 'mui';
            if (id.includes('framer-motion')) return 'framer-motion';
            if (
              id.includes('react-router-dom') ||
              id.includes('react-redux') ||
              id.includes('@reduxjs/toolkit') ||
              id.includes('/react/') ||
              id.includes('/react-dom/')
            ) {
              return 'react-vendor';
            }
          }
          return undefined;
        },
      },
    },
  },
})