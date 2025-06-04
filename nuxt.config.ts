import {defineNuxtConfig} from 'nuxt/config'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  compatibilityDate: "2024-09-19",
  nitro: {
    // https://nitro.build/deploy/providers/cloudflare
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    }
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-Hans-CN',
      },
      titleTemplate: '%s - 争逐',
      meta: [
        {name: 'viewport', content: 'width=device-width, initial-scale=1'},
        {name: 'charset', content: 'utf-8'},
        {name: 'Author', content: '争逐'},
      ],
    },
  },
  modules: ['@vueuse/nuxt'],

  // https://github.com/nuxt/framework/issues/6204#issuecomment-1201398080
  hooks: {
    'vite:extendConfig': function (config: any, {isServer}: any) {
      if (isServer) {
        // Workaround for netlify issue
        // https://github.com/nuxt/framework/issues/6204
        config.build.rollupOptions.output.inlineDynamicImports = true
      }
    },
  },
})
