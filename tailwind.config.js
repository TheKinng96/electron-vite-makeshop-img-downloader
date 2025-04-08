/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/index.html',
    './src/renderer/**/*.{js,ts,jsx,tsx}',
    './src/renderer/assets/**/*.css'
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['emerald', 'night'],
    darkTheme: 'night',
    darkMode: ['selector', '[data-theme="night"]'],
  },
}

