/** @type {import('tailwindcss').Config} */
export default {
  content: ["./pages/**/*.{html,js,tsx}", "./components/**/*.{html,js,tsx}"],
  theme: {
    extend: {
      screens: {
        "3xl": "1920px",
        "4xl": "2560px",
      },
    },
  },
  plugins: [],
};
