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
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          // Core palette
          background: '#0F1117',
          surface: '#161C27',
          'surface-variant': '#1E2636',
          // Brand accent — electric sky blue
          primary: '#38BDF8',
          secondary: '#818CF8',
          // Semantic
          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171',
          // Borders (referenced in CSS vars)
          'border-subtle': '#2A3347',
        },
      },
      light: {
        dark: false,
        colors: {
          background: '#F8FAFC',
          surface: '#FFFFFF',
          'surface-variant': '#F1F5F9',
          primary: '#0EA5E9',
          secondary: '#6366F1',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          'border-subtle': '#E2E8F0',
        },
      },
    },
  },
  defaults: {
    VCard: { rounded: 'lg', elevation: 0 },
    VBtn: { rounded: 'md' },
    VDataTable: { density: 'compact' },
  },
})
