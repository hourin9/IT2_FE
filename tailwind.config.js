/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dut: {
          // Bảng màu của bản mock (svdutudnvn.netlify.app)
          50: '#eff6ff',
          100: '#dbeafe',
          600: '#1e60b5',
          700: '#0b4386',
          800: '#003b7a',
          900: '#002b5c',
          surface: '#faf8ff',
          'surface-dim': '#d2d9f4',
          'surface-bright': '#faf8ff',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#f2f3ff',
          'surface-container': '#eaedff',
          'surface-container-high': '#e2e7ff',
          'surface-container-highest': '#dae2fd',
          'on-surface': '#131b2e',
          'on-surface-variant': '#434655',
          primary: '#0037b0',
          'on-primary': '#ffffff',
          'primary-container': '#1d4ed8',
          'on-primary-container': '#cad3ff',
          secondary: '#0051d5',
          'secondary-container': '#316bf3',
          outline: '#747686',
          'outline-variant': '#c4c5d7',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
