import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  if (command === 'serve') {
    // dev server config
    return {
      plugins: [react()],
      server: {
        proxy: {
          '/api': {
            target: 'https://www.desklearn.com',
            changeOrigin: true,
            secure: false,
          },
        },
      },
    }
  } else {
    // production build config
    return {
      plugins: [react()],
    }
  }
})
