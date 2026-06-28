/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm paper / canvas
        canvas: {
          DEFAULT: '#f6f4ee',
          subtle: '#efece3',
          raised: '#fbfaf6',
        },
        // Deep forest — primary brand
        forest: {
          50: '#eef2ee',
          100: '#d6e0d6',
          200: '#aec3ad',
          300: '#84a283',
          400: '#5d805c',
          500: '#436343',
          600: '#345034',
          700: '#2a402a',
          800: '#22331f',
          900: '#1c2b22',
          950: '#0f1810',
        },
        // Clay / terracotta — warm accent
        clay: {
          50: '#fbf2ec',
          100: '#f5ddcd',
          200: '#e9b89c',
          300: '#dd926c',
          400: '#d2724a',
          500: '#c25a36',
          600: '#a4472b',
          700: '#823826',
          800: '#5f2b20',
          900: '#3f1e17',
        },
        // Wheat / amber — secondary warm
        wheat: {
          50: '#fdf8ed',
          100: '#f8ecca',
          200: '#f0d690',
          300: '#e8bd5b',
          400: '#e0a534',
          500: '#cf8c22',
          600: '#b06e1c',
          700: '#8c5219',
          800: '#6e401b',
          900: '#5b3519',
        },
        ink: {
          DEFAULT: '#26241f',
          soft: '#54514a',
          faint: '#8a867c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28,43,34,0.04), 0 6px 20px -8px rgba(28,43,34,0.10)',
        lift: '0 2px 4px rgba(28,43,34,0.05), 0 18px 40px -16px rgba(28,43,34,0.22)',
        sheet: '0 -8px 40px -12px rgba(28,43,34,0.28)',
        glow: '0 8px 30px -6px rgba(194,90,54,0.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'check-pop': 'check-pop 0.3s cubic-bezier(0.22,1,0.36,1) both',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [],
}
