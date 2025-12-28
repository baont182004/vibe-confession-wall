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
        app: {
          bg: '#FFF7FB',
          tint: '#FEC5E6',
        },
        background: 'var(--bg0)',
        backgroundAlt: 'var(--bg1)',
        surfaceTint: 'var(--surfaceTint)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface2)',
        },
        border: 'var(--border)',
        divider: 'var(--divider)',
        text: {
          DEFAULT: 'var(--text)',
          strong: 'var(--textStrong)',
          muted: 'var(--textMuted)',
        },
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        warning: {
          DEFAULT: 'var(--warning)',
          strong: 'var(--warningStrong)',
          soft: 'var(--warningSoft)',
          border: 'var(--warningBorder)',
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
        sans: ['"Be Vietnam Pro"', 'Sora', 'Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
