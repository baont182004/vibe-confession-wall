import defaultTheme from 'tailwindcss/defaultTheme';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg0)',
        backgroundAlt: 'var(--bg1)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface2)',
        },
        border: 'var(--border)',
        text: {
          DEFAULT: 'var(--text)',
          muted: 'var(--textMuted)',
        },
        blue: 'var(--blue)',
        cyan: 'var(--cyan)',
        purple: 'var(--purple)',
        green: 'var(--green)',
        red: 'var(--red)',
        orange: 'var(--orange)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        card: 'var(--shadow)',
      },
      fontFamily: {
        sans: ['Sora', 'Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
