/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#8B004A',
          50:  '#FDF2F7',
          100: '#FAE0EE',
          200: '#F2B3D2',
          300: '#E47FAF',
          400: '#CC4D8B',
          500: '#8B004A',
          600: '#7A003F',
          700: '#620032',
          800: '#4A0025',
          900: '#320018',
        },
        cream: {
          DEFAULT: '#F2EFE7',
          50:  '#FDFCFA',
          100: '#F8F6F1',
          200: '#F2EFE7',
          300: '#EAE6DB',
          400: '#DDD8CC',
          500: '#C8C1B3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'pulse-brand': 'pulseBrand 2s ease-in-out infinite',
        'fade-up': 'fadeUp 0.4s ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-12px)' },
        },
        pulseBrand: {
          '0%, 100%': { opacity: '0.6' },
          '50%':       { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'brand-sm':  '0 2px 8px rgba(139,0,74,0.15)',
        'brand':     '0 4px 20px rgba(139,0,74,0.25)',
        'brand-lg':  '0 8px 40px rgba(139,0,74,0.30)',
        'card':      '0 2px 16px rgba(0,0,0,0.06)',
        'card-hover':'0 8px 32px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
