/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        large: "132px",
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        white: "#ffffff",
        background: "#f1f1f1",
        dark: {
          100: "#EDEDED",
          200: "#D9D9D9",
          300: "#C1C1C1",
          400: "#9C9C9C",
          500: "#515151",
          600: "#3A3A3A",
        },
        authGreen: {
          100: "#E8EAE7",
          200: "#DBE0D7",
          300: "#C4CFBD",
          400: "#B5C6B4",
          500: "#94AF8E",
          600: "#718F6B",
        },
        authBlue: {
          500: "#6889A7",
        },
        authYellow: {
          300: "#FBE09C",
          500: "#DCAE36",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
