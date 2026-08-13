/// <reference types="vitest" />
// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
      // Compile Vuetify's styles from source so src/styles/settings.scss can
      // override Sass variables (see that file: it pins the Vuetify 3 grid
      // breakpoints). Without this, the precompiled vuetify/styles CSS is
      // used and Sass settings are ignored.
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/tests/setup.ts',
    // Keep vitest scoped to unit/component specs under src/. Without this,
    // vitest's default include glob also picks up e2e/*.spec.ts (the
    // Playwright smoke test), which fails immediately since it can only run
    // under the `playwright test` runner.
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
  },

  base: process.env.CI
    ? '/vlinder/'
    : '/dashboard/',

  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
  },
})
