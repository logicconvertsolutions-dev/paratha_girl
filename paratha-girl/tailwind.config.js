/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ivory:      { DEFAULT: '#F9F4EC', dark: '#EEE6D8', mid: '#F2EDE3' },
        forest:     { DEFAULT: '#1E3B2F', light: '#2D5241', pale: '#3A6B53' },
        gold:       { DEFAULT: '#B8882A', light: '#D4A84B' },
        spice:      '#C4501A',
        ink:        '#1A1208',
        muted:      '#6B5C45',
      },
      fontFamily: {
        serif:  ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:   ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'ticker':    'ticker 24s linear infinite',
        'fade-up':   'fadeUp 0.7s ease both',
      },
      keyframes: {
        ticker:  { to: { transform: 'translateX(-50%)' } },
        fadeUp:  { from: { opacity: '0', transform: 'translateY(22px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
