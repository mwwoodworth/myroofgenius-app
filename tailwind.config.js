module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--color-bg)",
          card: "#1C1C1E",
        },
        accent: "rgb(var(--clr-accent-orange) / <alpha-value>)",
        primary: "rgb(var(--clr-primary-900) / <alpha-value>)",
        secondary: "rgb(var(--clr-secondary-700) / <alpha-value>)",
        success: "rgb(var(--clr-accent-emerald) / <alpha-value>)",
        text: {
          primary: "var(--color-text)",
          secondary: "var(--color-neutral-500)",
        },
        "accent-emerald": "rgb(var(--clr-accent-emerald) / <alpha-value>)",
        "accent-pink": "rgb(var(--clr-accent-pink) / <alpha-value>)",
        charcoalBlack: "#121212",
        offWhite: "#F0F0F0",
        neonGreen: "#00FF85",
        electricBlue: "#1E90FF",
        darkGray: "#444444",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg,#1a223f 0%,#364489 50%,#8276c5 100%)",
        "brand-gradient-alt":
          "linear-gradient(135deg,#364489 0%,#5256a4 45%,#1a223f 100%)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Anton", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.6" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        ripple: "ripple 0.6s linear",
        gradientShift: "gradientShift 20s ease infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    function ({ addUtilities, addComponents, theme }) {
      addUtilities({
        ".glass": {
          "backdrop-filter": "blur(12px)",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
        },
        ".glow-btn": {
          transition: "all 0.3s ease",
          "box-shadow": "0 0 8px rgba(255,255,255,0.6)",
        },
        ".glow-btn:hover": {
          "box-shadow": "0 0 12px rgba(255,255,255,0.9)",
        },
        ".glass-card": {
          "backdrop-filter": "blur(16px)",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          "box-shadow": "0 4px 30px rgba(0,0,0,0.1)",
        },
        ".glass-navbar": {
          "backdrop-filter": "blur(10px)",
          background: "rgba(35,35,35,0.75)",
          border: "1px solid rgba(255,255,255,0.07)",
        },
        ".bg-gradient-animated": {
          background: "linear-gradient(130deg,#0f0c29,#302b63,#24243e,#005f9e,#28a745)",
          backgroundSize: "500% 500%",
          animation: "gradientShift 20s ease infinite",
        },
      });

      const rippleKeyframes = {
        ".animate-ripple": {
          position: "relative",
          overflow: "hidden",
        },
        ".animate-ripple::after": {
          content: "''",
          position: "absolute",
          borderRadius: "9999px",
          transform: "scale(0)",
          animation: "ripple 0.6s linear",
          background: theme("colors.accent"),
          opacity: "0.4",
        },
      };
      addComponents(rippleKeyframes);
    },
  ],
};
