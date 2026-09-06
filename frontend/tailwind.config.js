/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fcfcf9',
          100: '#f8f6f0',
          200: '#f0ebd9',
          300: '#e2dacd',
          400: '#c8bfae',
          800: '#292524',
          900: '#1c1917',
        },
        saffron: {
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        dark: {
          950: '#070b14',
          900: '#0b1120',
          850: '#10182b',
          800: '#152037',
          700: '#1e2d4d',
          600: '#2c3e66',
        },
        intel: {
          cyan: '#0284c7',
          blue: '#2563eb',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48',
          purple: '#7c3aed',
          saffron: '#ea580c'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
