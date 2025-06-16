/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: "#1e40af", // brand blue
        secondary: "#f97316", // brand orange
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        roofgenius: {
          primary: "#1e40af",
          secondary: "#f97316",
          accent: "#37cdbe",
          neutral: "#3d4451",
          "base-100": "#ffffff",
        },
      },
    ],
  },
};
