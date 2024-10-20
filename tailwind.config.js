/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        'fore': {
          DEFAULT: '#efefef',
          1: '#efefef',
          2: '#cfcfcf',
          3: '#afafaf',
          4: '#8f8f8f',
          5: '#6f6f6f',
          main: '#005fdd66'
        },
        'back': {
          DEFAULT: '#1f1f1f',
          1: '#1f1f1f',
          2: '#2f2f2f',
          3: '#3f3f3f',
          4: '#4f4f4f',
          5: '#5f5f5f',
          main: '#005fdd11'
        },

        'overlay': {
          DEFAULT: '#00000099',
        },

        'main': {
          DEFAULT: '#005fdd',
          tr: '#005fdd99',
        },
        'main-hover': {
          DEFAULT: '#0078e7',
          tr: '#005fdd4d',
        },
        'main-focus': {
          DEFAULT: '#0078e7',
        },
        'main-acc': {
          DEFAULT: '#00abe7',
          tr: '#00abe799',
        },

        'warn': '#f28618',
        'error': '#da3333'
      }
    },
  },
  plugins: [],
}

