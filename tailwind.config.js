/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#00d2a0',
          secondary: '#00b4d8',
        },
        bg: {
          base: '#0f0f1a',
          surface: '#16213e',
        }
      }
    },
  },
  plugins: [],
}

