/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#C05621',
          50: '#FFF5F0',
          100: '#FFEADF',
          200: '#FBD3C1',
          300: '#F7A07B',
          400: '#F07D4F',
          500: '#C05621',
          600: '#A0461C',
          700: '#803816',
          800: '#602A11',
          900: '#401C0B',
        },
        forest: {
          DEFAULT: '#2F5D50',
          50: '#E9F1EF',
          100: '#D3E3DF',
          200: '#A7C7BF',
          300: '#7BABA0',
          400: '#4F8F80',
          500: '#2F5D50',
          600: '#264B41',
          700: '#1D3932',
          800: '#142722',
          900: '#0A1411',
        },
        sand: {
          DEFAULT: '#F5E6D3',
          50: '#FEFDFB',
          100: '#FDFBF7',
          200: '#FBF7EF',
          300: '#F9F3E7',
          400: '#F7EFDF',
          500: '#F5E6D3',
          600: '#EAD1B0',
          700: '#DFBC8D',
          800: '#D4A76A',
          900: '#C99247',
        },
        offwhite: '#FAF9F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
}