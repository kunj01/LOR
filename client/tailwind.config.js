/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: '#2273f5',
        primaryDark: '#065fe0',
        primaryLight: '#d6e5ff',
        primaryLight2: '#c7d8f8',
        primaryTranslucent: '#5395ff3f',
        primaryTranslucentHover: '#5395ff1f',
        secondary: '#ebf5ff',
        tertiary: '#ff6d02',
        green: '#2eb26d',
        gradient1: '#7c56fb',
        gradient2: '#2252cc',
        background: {
          dark: '#141415',
          darkLight: '#1d1d1f',
          darkLight2: '#2a2a2a',
          light: '#fff',
          grey: '#f1f1f1',
          greyLight: '#f6f6f6',
          greyTranslucent: '#f7f7f7aa',
          greyDark: '#ddd',
          red: '#e9612c',
          redTranslucent: '#fcdee1',
          redTranslucent2: '#fcdee177',
        },
        font: {
          white: '#fbfcff',
          light: '#d4d4d4',
          grey: '#a1a1a1',
          darkGrey: '#7a7a7a',
          dark: '#333'
        },
        border: {
          light: '#e0e0e0',
          dark: '#2f2f2f',
          primary: '#1573ed',
          primaryDark: '#003d7f',
        }
      },
      backgroundImage: {
        'loginBackground' : "url('/images/slideshow (1).jpg')",
      },
    },
  },
  plugins: [],
}