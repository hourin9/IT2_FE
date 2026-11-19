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
          surface: '#f8fafc',
          'surface-dim': '#e2e8f0',
          'surface-bright': '#ffffff',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#f8fafc',
          'surface-container': '#f1f5f9',
          'surface-container-high': '#e2e8f0',
          'surface-container-highest': '#cbd5e1',
          'on-surface': '#0f172a',
          'on-surface-variant': '#475569',
          primary: '#003b7a',
          'on-primary': '#ffffff',
          'primary-container': '#0b4386',
          'on-primary-container': '#dbeafe',
          secondary: '#1e60b5',
          'secondary-container': '#2563eb',
          outline: '#64748b',
          'outline-variant': '#cbd5e1',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
