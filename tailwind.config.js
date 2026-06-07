/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0B1120',
        gold: '#C9A84C',
        ivory: '#FAF7F0',
        blush: '#F2C6C2',
      },
      animation: {
        fadeIn: 'fadeIn 0.8s ease-in',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
