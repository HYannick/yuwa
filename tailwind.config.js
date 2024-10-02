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
        display: ['Merriweather', 'sans-serif'],
        body: ['Nunito Sans Variable', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

