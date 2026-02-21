// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'traq-dark': '#0D1B2A',
        'traq-card': '#1B2838',
        'traq-accent': '#2D4059',
        'traq-cyan': '#00BCD4',
      },
    },
  },
  plugins: [],
};
