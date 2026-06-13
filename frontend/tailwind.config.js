// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'shine': 'shine 3s infinite linear',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'shimmer': 'shimmer 3s infinite',
        'pulse': 'pulse 2s infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(10deg)' },
        },
        'pulse-ring': {
          '0%': {
            transform: 'scale(0.8)',
            opacity: '0.8',
          },
          '80%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        shine: {
          '0%': {
            left: '-60%',
          },
          '100%': {
            left: '120%',
          },
        },
        'gradient-shift': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        shimmer: {
          '0%': {
            transform: 'translateX(-100%) rotate(30deg)',
          },
          '100%': {
            transform: 'translateX(100%) rotate(30deg)',
          },
        },
        pulse: {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 0 10px rgba(139, 92, 246, 0)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}