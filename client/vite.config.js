import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
   build: {
    outDir: 'dist',
  },
  server: {
    historyApiFallback: true,
     proxy: {
      '/api': {
        target: 'https://ijspr.onrender.com',   // your backend URL
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api')
      }
    }
  }
  
})

