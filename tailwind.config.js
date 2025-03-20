const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['"Nunito"', "sans-serif"],
        montserrat: ['"Montserrat"', "sans-serif"],
        poppins: ['"Poppins"', "sans-serif"],
        sen: ['"Sen"', "sans-serif"],
      },
      boxShadow: {
        'custom-dark': 'inset -5px 5px 15px 5px rgba(59, 130, 246, 0.7)',
      },
      colors: {
        primary: {
          50: "#edeafd",
          100: "#dbd7fa",
          200: "#b8b0f6",
          300: "#948af1",
          400: "#7167ee",
          500: "#5245ec", // Main primary color
          600: "#4237bd",
          700: "#312a8e",
          800: "#211b5f",
          900: "#100e2f",
          DEFAULT: "#5245ec", // Main reference
          foreground: "#FFFFFF",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui(), require("tailwindcss-animate")],
}
