/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main Palette
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#20B24D', // Main WBAC Green
          600: '#1a9a3e',
          700: '#158234',
          800: '#116a2a',
          900: '#0d5221',
        },
        // Paleta Secundaria
        secondary: {
          cyan: '#008FD5',
          yellow: '#FDB813',
          purple: '#5B56A6',
          red: '#ED1B24',
          pink: '#F272AD',
        },
        // Paleta de Fondos
        background: {
          cream: '#FFF9E6',
          lightGray: '#F5F5F5',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        // Univers as primary font with fallbacks
        sans: ['Univers', 'Arial Rounded MT Bold', 'Arial', 'Tahoma', 'Verdana', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}


