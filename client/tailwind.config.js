/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#090719',
        'royal-purple': '#21103D',
        'rich-maroon': '#4A1028',
        'metallic-gold': '#FFD36A',
        'warm-champagne': '#FFF0C2',
        'diya-orange': '#FF8A24',
        'ivory-white': '#FFF9ED',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        'cinzel-dec': ['"Cinzel Decorative"', 'Cinzel', 'serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
