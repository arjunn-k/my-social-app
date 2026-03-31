/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        sand: "#f7f2ea",
        coral: "#f26a4b",
        moss: "#3c6e57",
        gold: "#f2bc57",
        slate: "#405266"
      },
      boxShadow: {
        card: "0 20px 60px rgba(20, 20, 20, 0.08)"
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "sans-serif"],
        display: ["'DM Serif Display'", "serif"]
      }
    }
  },
  plugins: []
};

