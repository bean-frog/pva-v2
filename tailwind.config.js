/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [require("daisyui")],
  mode: 'jit',
  content: [],
  theme: {
    extend: {},
  },
  content: [
    '*.{js,html}',
  ],
  daisyui: {
    themes: false,
    darkTheme: "dark", 
    base: true, 
    styled: true, 
    utils: true,
    rtl: false,
    prefix: "", 
    logs: false,
  }
}

