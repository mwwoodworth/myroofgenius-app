module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#121212',
          card: '#1C1C1E',
        },
        accent: '#5E5CE6',
        text: {
          primary: '#F2F2F7',
          secondary: '#8E8E93',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addUtilities }) {
      addUtilities({
        '.glass': {
          'backdrop-filter': 'blur(12px)',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)'
        },
        '.glow-btn': {
          transition: 'all 0.3s ease',
          'box-shadow': '0 0 8px rgba(255,255,255,0.6)'
        },
        '.glow-btn:hover': {
          'box-shadow': '0 0 12px rgba(255,255,255,0.9)'
        }
      })
    }
  ],
}
