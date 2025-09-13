import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      plugins: [react()],
      server: {
        proxy: {
          '/api': {
            target: 'https://api.desklearn.com',
            changeOrigin: true,
            secure: false,
          },
        },
      },
    }
  } else {
    return {
      plugins: [react()],
      base: './',
      build: {
        outDir: 'dist',
      },
    }
  }
})
