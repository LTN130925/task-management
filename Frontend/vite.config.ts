import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import env from 'dotenv';

env.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.VITE_PORT as unknown as number,
    strictPort: true,
    host: true,
  },
});
