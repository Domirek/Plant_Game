import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.bin', '**/*.png'],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
