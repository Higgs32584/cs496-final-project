import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // keep the REACT_APP_* names from create-react-app working (e.g. REACT_APP_API_URL in my-app/.env)
  envPrefix: ['VITE_', 'REACT_APP_'],
  server: {
    // the server's CORS origin defaults to http://localhost:3000
    port: 3000,
    strictPort: true,
    open: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
