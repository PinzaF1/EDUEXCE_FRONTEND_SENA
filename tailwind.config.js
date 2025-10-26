/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",   //  para que Tailwind lea tus TSX
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
