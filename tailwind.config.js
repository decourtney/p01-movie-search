/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './assets/src/**/*.{html,js}',
    './index.html'
  ],
  theme: {
    extend: {},
  },
  plugins: [require('node-modules/tw-elements/dist/plugin')],
}
