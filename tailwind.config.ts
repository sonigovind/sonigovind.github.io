import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050d1b',
          900: '#0a1628',
          800: '#0f2040',
          700: '#162844',
        },
        gold: {
          400: '#f0b429',
          300: '#f7d072',
          200: '#fde68a',
        },
        mist: '#e8eef7',
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
        'float-a': 'floatA 10s ease-in-out infinite',
        'float-b': 'floatB 14s ease-in-out infinite',
        'float-c': 'floatC 12s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-x': 'gradientX 8s ease infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        floatA: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(40px,-60px) scale(1.06)' },
          '66%': { transform: 'translate(-30px,30px) scale(0.94)' },
        },
        floatB: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(-50px,-40px) scale(1.08)' },
        },
        floatC: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '40%': { transform: 'translate(30px,50px) scale(0.95)' },
          '80%': { transform: 'translate(-20px,-20px) scale(1.04)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientX: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      boxShadow: {
        'glow-gold': '0 0 40px rgba(240, 180, 41, 0.25)',
        'glow-gold-lg': '0 0 80px rgba(240, 180, 41, 0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
