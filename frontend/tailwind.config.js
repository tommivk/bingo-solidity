/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkSecondary: "#2c2d3382",
        markedNumber: "#32993a"
      },
      screens: {
        "xxs": "310px",
        "xs": "415px"
      }
    },
  },
  plugins: [],
}
