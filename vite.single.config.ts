// Сборка в один HTML-файл (для быстрого превью/публикации): npx vite build -c vite.single.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist-single', chunkSizeWarningLimit: 4000, assetsInlineLimit: 100000000 },
})
