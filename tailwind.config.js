/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#030014',
          light: '#cecefb',
        },
        dark: {
          100: '#0f0d23',
          200: '#0a0818',
        },
        light: {
          100: '#cecefb',
          200: '#a8b5db',
        },
      },
      screens: {
        'xs': '480px',
      },
      backgroundImage: {
        'hero-pattern': "url('/hero-bg.webp')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s infinite',
      },
    },
  },
  plugins: [],
}
