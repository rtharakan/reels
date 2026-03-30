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
        // Warm neutral palette
        warm: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        // Accent: terracotta / warm coral
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#E8927C',
          500: '#D4856A',
          600: '#C2714E',
          700: '#9A5838',
          800: '#7C4A30',
          900: '#5E3A26',
        },
        // Soft sage for secondary / success
        sage: {
          50: '#F6F7F4',
          100: '#E8EBE2',
          200: '#D4DAC7',
          300: '#B5BFA3',
          400: '#A3B18A',
          500: '#8A9A70',
          600: '#6B7A56',
          700: '#556144',
          800: '#454F38',
          900: '#3A4230',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'soft-md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03)',
        'soft-lg': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.03)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
