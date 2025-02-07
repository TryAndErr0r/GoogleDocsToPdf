/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-darker': 'var(--primary-darker)',
        secondary: 'var(--secondary)',
        'secondary-darker': 'var(--secondary-darker)',
      },
    },
  },
  plugins: [],
}

