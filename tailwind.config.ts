import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        is: {
          blue:    '#008BCA',
          'blue-dk': '#0077b5',
          gray:    '#4d4d4d',
          green:   '#1BAC4B',
          orange:  '#FF7F00',
          light:   '#F6F7F8',
          border:  '#E2E5E8',
          muted:   '#9199A3',
          text:    '#1A1A2E',
        },
      },
    },
  },
  plugins: [],
};

export default config;
