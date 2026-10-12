import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/library-management-system-by-malelu/',
  plugins: [react()],
});