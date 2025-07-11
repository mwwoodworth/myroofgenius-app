module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--color-bg)",
          card: "var(--color-white)",
        },
        primary: "rgb(var(--clr-primary-500) / <alpha-value>)",
        accent: "rgb(var(--clr-primary-500) / <alpha-value>)",
        secondary: "#4A5568",
        success: "rgb(var(--clr-success-500) / <alpha-value>)",
        warning: "rgb(var(--clr-warning-500) / <alpha-value>)",
        danger: "rgb(var(--clr-danger-500) / <alpha-value>)",
        text: {
          primary: "var(--color-text)",
          secondary: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        h1: ["48px", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["36px", { lineHeight: "1.3", fontWeight: "700" }],
        h3: ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        base: ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        sm: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["14px", { lineHeight: "1.5", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      spacing: {
        0: "0px",
        1: "0.5rem",
        2: "1rem",
        3: "1.5rem",
        4: "2rem",
        5: "2.5rem",
        6: "3rem",
        7: "3.5rem",
        8: "4rem",
        9: "4.5rem",
        10: "5rem",
        11: "5.5rem",
        12: "6rem",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
