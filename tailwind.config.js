/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a1815",
        ivory: "#ffffff",
        parchment: "#fff9ec",
        gold: "#d4af37",
        goldDark: "#b88a2b",
        goldSoft: "#f3e7c5",
        slate: "#4a4336"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
