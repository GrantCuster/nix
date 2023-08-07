/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gruvbox: {
          'background': '#282828',
          'foreground': '#ebdbb2',
          'dark0': '#1d2021',
          'dark1': '#3c3836',
          'dark2': '#504945',
          'dark3': '#554c54',
          'dark4': '#7c6f64',
          'light0': '#fbf1c7',
          'light1': '#d5c4a1',
          'light2': '#bdae93',
          'light3': '#a89984',
          'light4': '#928374',
          'red': '#fb4934',
          'green': '#b8bb26',
          'yellow': '#fabd2f',
          'blue': '#83a598',
          'purple': '#d3869b',
          'aqua': '#8ec07c',
          'orange': '#fe8019',

        },
      },
    },
  },
  plugins: [],
}
