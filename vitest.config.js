import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
