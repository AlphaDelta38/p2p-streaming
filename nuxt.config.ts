import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@nuxtjs/i18n', 'nuxt-aweasome-http'],

  runtimeConfig: {
    public: {
      meteredApiKey: '',
    },
  },

  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
      { code: 'uk', language: 'uk-UA', file: 'uk.json', name: 'Українська' },
      { code: 'ru', language: 'ru-RU', file: 'ru.json', name: 'Русский' },
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
  },

  css: [
    '~/assets/fonts/inter/minified.css',
    '~/assets/css/main.css'
  ],

  app: {
    head: {
      title: 'P2P Streaming — WebRTC Mesh',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Share your screen with anyone. No server needed. Pure WebRTC mesh.' },
      ],
      link: [
        {
          rel: 'preload',
          as: 'style',
          href: '~/assets/fonts/inter/minified.css',
          crossorigin: ''
        }
      ]
    },
  },
})