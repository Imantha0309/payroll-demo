/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    // Disable preflight to avoid conflicts with Bootstrap's base styles
    preflight: false
  },
  theme: {
    extend: {}
  },
  plugins: []
};

