/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0A0F1A',
        'accent-blue': '#00BFFF',
        'accent-teal': '#33FFDD',
        'alert-red': '#FF4136',
      },
      boxShadow: {
        glow: '0 0 10px rgba(0, 191, 255, 0.5)',
      },
    },
  },
  plugins: [],
}