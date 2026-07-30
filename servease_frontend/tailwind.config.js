/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#146C5F',
          50: '#EEF8F5',
          100: '#D7EFE8',
          200: '#A9DCCD',
          300: '#78C6B0',
          400: '#3DA98E',
          500: '#146C5F',
          600: '#0E5A50',
          700: '#0B473F',
          800: '#083832',
          900: '#052622',
        },
        secondary: {
          DEFAULT: '#1B2430',
          50: '#F7F4EC',
          100: '#ECE4D3',
          200: '#D8C6A1',
          300: '#BFA36F',
          400: '#80623C',
          500: '#1B2430',
          600: '#151C25',
          700: '#10161D',
          800: '#0B1016',
          900: '#070A0E',
        },
        accent: {
          DEFAULT: '#C28B2C',
          50: '#FFF8E8',
          100: '#F8E9BB',
          200: '#EBCF7D',
          300: '#DEB040',
          400: '#C9962B',
          500: '#C28B2C',
          600: '#9E6F1F',
          700: '#795318',
          800: '#573C12',
          900: '#34240A',
        },
        warning: '#F59E0B',
        success: '#22C55E',
        danger: '#EF4444',
      },
      fontFamily: {
        poppins: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 24px rgba(194, 139, 44, 0.34)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #146C5F 0%, #1B2430 50%, #C28B2C 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
