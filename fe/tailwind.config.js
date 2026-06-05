/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        textLight: "#3b82f6",
        textDark: "#7dd3fc",
        bgDark: "#111827",
      }
    },
  },
  plugins: [],
}
