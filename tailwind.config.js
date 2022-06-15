module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      animation: {
        "spin-fast-slow":
          "1s ease-in-out 0s infinite normal none running inner",
      },
      keyframes: {
        wiggle: {
          "0%": { strokeDashoffset: 187 },
          "25%": { strokeDashoffset: 80 },
          "100%": { transform: "rotate(360deg)", strokeDashoffset: 187 },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
