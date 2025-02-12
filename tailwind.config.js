/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  plugins: [require('tailwindcss-primeui')],
  theme: {
    extend: {
      colors: {
        overlay: {
          240: 'rgba(var(--p-primary-400), 0.5)',
          250: '#3060f02f',
          260: '#2443e02f',
          270: '#1b33d12f',
          280: '#1a27992f',
          440: '#4983f54f',
          450: '#3060f04f',
          460: '#2443e04f',
          470: '#1b33d14f',
          480: '#1a27994f',
          640: '#4983f56f',
          650: '#3060f06f',
          660: '#2443e06f',
          670: '#1b33d16f',
          680: '#1a27996f',
          840: '#4983f58f',
          850: '#3060f08f',
          860: '#2443e08f',
          870: '#1b33d18f',
          880: '#1a27998f',
        },

        primary: {
          50: 'var(--p-primary-50)',
          100: 'var(--p-primary-100)',
          200: 'var(--p-primary-200)',
          300: 'var(--p-primary-300)',
          400: 'var(--p-primary-400)',
          500: 'var(--p-primary-500)',
          600: 'var(--p-primary-600)',
          700: 'var(--p-primary-700)',
          800: 'var(--p-primary-800)',
          900: 'var(--p-primary-900)',
          950: 'var(--p-primary-950)'
        },
        surface: {
          0: 'var(--p-surface-0)',
          50: 'var(--p-surface-50)',
          100: 'var(--p-surface-100)',
          200: 'var(--p-surface-200)',
          300: 'var(--p-surface-300)',
          400: 'var(--p-surface-400)',
          500: 'var(--p-surface-500)',
          600: 'var(--p-surface-600)',
          700: 'var(--p-surface-700)',
          800: 'var(--p-surface-800)',
          900: 'var(--p-surface-900)',
          950: 'var(--p-surface-950)'
        },

        'warn': '#f28618',
        'error': '#da3333',

        'axis': {
          x: '#ed0c15',
          y: '#1cd715',
          z: '#0825db'
        }
      }
    }
  },
  plugins: [],
}