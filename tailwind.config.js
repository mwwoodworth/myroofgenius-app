const tokens = require("./design-system/tokens.json");

module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: tokens.colors["color-bg-default"],
          card: tokens.colors["color-bg-card"],
        },
        primary: tokens.colors["color-primary-base"],
        accent: tokens.colors["color-accent-base"],
        secondary: tokens.colors["color-secondary-base"],
        success: tokens.colors["color-success-base"],
        warning: tokens.colors["color-warning-base"],
        danger: tokens.colors["color-danger-base"],
        text: {
          primary: tokens.colors["color-text-primary"],
          secondary: tokens.colors["color-text-secondary"],
        },
      },
      fontFamily: {
        sans: tokens.fontFamily["font-family-sans"],
        mono: tokens.fontFamily["font-family-mono"],
      },
      fontSize: {
        h1: [
          tokens.fontSize["font-size-h1"],
          { lineHeight: "1.2", fontWeight: "700" },
        ],
        h2: [
          tokens.fontSize["font-size-h2"],
          { lineHeight: "1.3", fontWeight: "700" },
        ],
        h3: [
          tokens.fontSize["font-size-h3"],
          { lineHeight: "1.4", fontWeight: "600" },
        ],
        base: [
          tokens.fontSize["font-size-base"],
          { lineHeight: "1.5", fontWeight: "400" },
        ],
        sm: [
          tokens.fontSize["font-size-sm"],
          { lineHeight: "1.5", fontWeight: "400" },
        ],
        label: [
          tokens.fontSize["font-size-label"],
          { lineHeight: "1.5", fontWeight: "500" },
        ],
        caption: [
          tokens.fontSize["font-size-caption"],
          { lineHeight: "1.5", fontWeight: "400" },
        ],
      },
      spacing: Object.fromEntries(
        Object.entries(tokens.spacing).map(([k, v]) => [
          k.replace("spacing-", ""),
          v,
        ]),
      ),
      borderRadius: {
        DEFAULT: tokens.radius["radius-DEFAULT"],
        lg: tokens.radius["radius-lg"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
