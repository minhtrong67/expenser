/** @type {import('tailwindcss').Config} */

// Every Material Design 3 colour role is exposed as a CSS variable holding an
// "r g b" triplet (set from src/theme), so Tailwind can apply opacity
// modifiers (e.g. `bg-on-surface/12`) and the whole palette can be swapped at
// runtime without rebuilding any CSS.
const role = (name) => `rgb(var(--md-${name}) / <alpha-value>)`;

const ROLES = [
  'primary', 'on-primary', 'primary-container', 'on-primary-container',
  'secondary', 'on-secondary', 'secondary-container', 'on-secondary-container',
  'tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container',
  'error', 'on-error', 'error-container', 'on-error-container',
  'background', 'on-background',
  'surface', 'on-surface', 'surface-variant', 'on-surface-variant',
  'outline', 'outline-variant', 'shadow', 'scrim',
  'inverse-surface', 'inverse-on-surface', 'inverse-primary', 'surface-tint',
  'surface-dim', 'surface-bright',
  'surface-container-lowest', 'surface-container-low', 'surface-container',
  'surface-container-high', 'surface-container-highest',
  // Semantic money colours
  'income', 'on-income', 'income-container', 'on-income-container',
  'expense', 'on-expense', 'expense-container', 'on-expense-container',
];

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif'],
      },
      colors: Object.fromEntries(ROLES.map((r) => [r, role(r)])),
      // Material 3 type scale
      fontSize: {
        'display-sm': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '0' }],
        'headline-lg': ['2rem', { lineHeight: '2.5rem', letterSpacing: '0' }],
        'headline-md': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '0' }],
        'headline-sm': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0' }],
        'title-lg': ['1.375rem', { lineHeight: '1.75rem', letterSpacing: '0' }],
        'title-md': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.009em', fontWeight: '500' }],
        'title-sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.006em', fontWeight: '500' }],
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.006em', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.031em', fontWeight: '500' }],
        'label-sm': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.045em', fontWeight: '500' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.031em' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.016em' }],
        'body-sm': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.033em' }],
      },
      borderRadius: { '4xl': '1.75rem' },
      boxShadow: {
        'elev-1': '0 1px 2px rgb(var(--md-shadow) / 0.3), 0 1px 3px 1px rgb(var(--md-shadow) / 0.15)',
        'elev-2': '0 1px 2px rgb(var(--md-shadow) / 0.3), 0 2px 6px 2px rgb(var(--md-shadow) / 0.15)',
        'elev-3': '0 1px 3px rgb(var(--md-shadow) / 0.3), 0 4px 8px 3px rgb(var(--md-shadow) / 0.15)',
      },
      transitionTimingFunction: {
        emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
        'emphasized-decel': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        'emphasized-accel': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'fade-through': {
          '0%': { opacity: 0, transform: 'scale(0.98) translateY(4px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'sheet-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.92)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'menu-in': {
          '0%': { opacity: 0, transform: 'scale(0.95) translateY(-4px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: 'var(--ripple-alpha, 0.16)' },
          '100%': { transform: 'scale(1)', opacity: 0 },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms cubic-bezier(0.2, 0, 0, 1)',
        'fade-through': 'fade-through 300ms cubic-bezier(0.05, 0.7, 0.1, 1) both',
        'slide-up': 'slide-up 350ms cubic-bezier(0.05, 0.7, 0.1, 1) both',
        'sheet-up': 'sheet-up 350ms cubic-bezier(0.05, 0.7, 0.1, 1) both',
        'sheet-right': 'sheet-right 350ms cubic-bezier(0.05, 0.7, 0.1, 1) both',
        'scale-in': 'scale-in 220ms cubic-bezier(0.05, 0.7, 0.1, 1) both',
        'menu-in': 'menu-in 160ms cubic-bezier(0.05, 0.7, 0.1, 1) both',
        shimmer: 'shimmer 1.6s infinite linear',
      },
    },
  },
  plugins: [],
};
