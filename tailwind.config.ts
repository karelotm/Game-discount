import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: '#12121A',
        'surface-light': '#1A1A25',
        cyan: {
          DEFAULT: '#00F0FF',
          dark: '#00B8C4',
        },
        magenta: {
          DEFAULT: '#FF2D6B',
          dark: '#CC2456',
        },
        muted: '#8888AA',
      },
      fontFamily: {
        heading: ['var(--font-rajdhani)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
