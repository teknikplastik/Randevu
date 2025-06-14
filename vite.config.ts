import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Supabase ve diğer harici kütüphanelerden gelen uyarıları sessizleştir
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        if (warning.code === 'THIS_IS_UNDEFINED') return
        if (warning.message.includes('Use of eval')) return
        if (warning.message.includes('sourcemap')) return
        warn(warning)
      }
    }
  },
  server: {
    hmr: {
      overlay: false // HMR overlay'ini kapat
    }
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});