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
        dark: {
          950: '#f7f9fc',
          900: '#ffffff',
          850: '#f0f3f7',
          800: '#e7ebf1',
          700: '#d4dbe5',
          600: '#aab6c5',
        },
        intel: {
          cyan: '#183b70',
          blue: '#2457a6',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#8b5cf6'
        },
        slate: {
          100: '#17233a',
          200: '#24324a',
          300: '#40516c',
          400: '#63738b',
          500: '#8390a2',
          600: '#68778e',
          700: '#52627a',
          800: '#d4dbe5',
          900: '#e7ebf1',
          950: '#f7f9fc'
        }
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'Consolas', 'monospace'],
        sans: ['IBM Plex Sans', 'Aptos', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
