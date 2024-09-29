/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      fontFamily: {
        display: ['Gowun Batang', 'sans-serif'],
        body: ['Anaheim', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

