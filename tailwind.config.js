/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6aaa64',
        secondary: '#c9b458', 
        tertiary: '#787c7e',
        border: '#d3d6da',
        card: '#ffffff',
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'game': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'game-hover': '0 8px 25px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'pop': 'pop 0.2s ease',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
