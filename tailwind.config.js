/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e74c3c',
        secondary: '#e67e22',
        dark: '#2c3e50',
        'dark-light': '#34495e',
        'light-gray': '#ffffff',
      },
      fontFamily: {
        inter: ['\'Inter\'', '-apple-system', 'BlinkMacSystemFont', '\'Segoe UI\'', 'sans-serif'],
      },
      gridTemplateColumns: {
        'dropdown': 'repeat(2, 1fr)',
      },
    },
  },
  plugins: [],
}
