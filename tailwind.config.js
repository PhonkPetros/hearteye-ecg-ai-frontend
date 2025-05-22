/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        orange: '#C68400',
        hearteye_orange: '#E49F00',
        hearteye_blue: '#0d3357',
        hearteye_blue_hover: '#1a4d75'
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
} 