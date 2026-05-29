import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0B1120',
          900: '#111827',
          800: '#1C2D40',
          700: '#253548',
        },
        royal: {
          700: '#1E3A8A',
          600: '#1D4ED8',
          500: '#2563EB',
          400: '#60A5FA',
          300: '#93C5FD',
        },
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundSize: {
        '300%': '300%',
      },
      animation: {
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 40px rgba(37, 99, 235, 0.2)',
        'glow-blue-lg': '0 0 80px rgba(37, 99, 235, 0.15)',
        'card': '0 2px 12px rgba(15,23,42,0.08)',
        'card-hover': '0 12px 40px rgba(30,58,138,0.14)',
      },
    },
  },
  plugins: [],
};

export default config;
