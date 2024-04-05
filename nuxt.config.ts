import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'


// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins?.push(vuetify({ autoImport: true }))
      })
    }],
  imports: {
    dirs: ['types/*.ts'],
  },
  css: ['vuetify/lib/styles/main.sass'],
  build: {
    transpile: ['vuetify', 'tiptap-vuetify'],
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
})
