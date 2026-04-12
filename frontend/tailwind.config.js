/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#059669', // Emerald
          dark: '#064E3B',
          glow: 'rgba(5, 150, 105, 0.15)',
        },
        secondary: {
          DEFAULT: '#1E3A8A', // Royal Blue
          glow: 'rgba(30, 58, 138, 0.15)',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          mut: '#F1F5F9',
          bg: '#F8FAFC',
        },
        accent: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '8px',
        'DEFAULT': '12px',
        'lg': '18px',
        'xl': '24px',
      },
      boxShadow: {
        'lux': '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
      }
    },
  },
  plugins: [],
}
