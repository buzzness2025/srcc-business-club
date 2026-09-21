/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        srcc: {
          dark: '#0f172a',
          primary: '#1e3a8a',
          secondary: '#b91c1c',
          accent: '#d97706',
          gold: '#f59e0b',
          surface: '#f8fafc',
          card: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}
