import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pastel: {
          50: '#f0f4fa',
          100: '#e0e9f5',
          200: '#c7d7ed',
          300: '#a3bfe0',
          400: '#7aa2d0',
          500: '#5b86c0',
          600: '#4570ab',
          700: '#3b5d8c',
          800: '#334e73',
          900: '#2d4361',
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
