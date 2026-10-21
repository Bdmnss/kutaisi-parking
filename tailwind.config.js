/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0E3A53', light: '#1A5878', dark: '#092838', 50: '#EEF4F7' },
        white: '#FFFFFF',
      },
      fontFamily: { sans: ['Inter', 'Noto Sans Georgian', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
