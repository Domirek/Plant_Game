import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Plant_Game/',
  assetsInclude: ['**/*.gltf', '**/*.bin', '**/*.png'],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
