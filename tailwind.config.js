module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        'background-elevated': 'var(--bg-elevated)',
        foreground: 'var(--fg)',
        'foreground-secondary': 'var(--fg-secondary)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
