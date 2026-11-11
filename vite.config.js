import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // O Recharts é uma biblioteca grande. Separar as bibliotecas de terceiros
    // em um "chunk" próprio deixa o aviso de tamanho do Vite quieto e melhora
    // o cache do navegador (o código da aplicação muda, a biblioteca não).
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          recharts: ['recharts'],
        },
      },
    },

    // O chunk do Recharts tem ~517 kB e é **carregado sob demanda**
    // (ver o `lazy()` em `src/App.jsx`), então ele não pesa no carregamento
    // inicial. Subimos o limite para o Vite não avisar sobre esse chunk.
    chunkSizeWarningLimit: 600,
  },
})
