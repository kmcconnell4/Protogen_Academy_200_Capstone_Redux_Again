import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#0A3D6B',
          secondary: '#0D7E8A',
          accent: '#0BBCD6',
          success: '#2E7D32',
          warning: '#F57C00',
          error: '#C62828',
          'on-time': '#2E7D32',
          'at-risk': '#F57C00',
          'critical-red': '#C62828',
          surface: '#FFFFFF',
          background: '#F4F6F9',
          'surface-variant': '#E9EEF4',
        },
      },
      dark: {
        colors: {
          primary: '#4A9FD8',
          secondary: '#26B8C8',
          accent: '#0BBCD6',
          success: '#4CAF50',
          warning: '#FFA726',
          error: '#EF5350',
          background: '#0D1117',
          surface: '#161B22',
          'surface-variant': '#1E2730',
        },
      },
    },
  },
  defaults: {
    VCard: { rounded: 'lg', elevation: 1 },
    VBtn: { rounded: 'md' },
    VDataTable: { density: 'compact' },
  },
})
