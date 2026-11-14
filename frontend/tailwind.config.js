/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        eco: {
          darkest: '#05080a',
          dark: '#070b0e',
          surface: '#0c1319',
          card: '#111b23',
          'card-hover': '#162430',
          border: '#1c2e3d',
          'border-light': '#263e52',
          neon: '#00ff87',
          'neon-dim': '#05d972',
          green: '#10b981',
          emerald: '#059669',
          cyan: '#00f0ff',
          'cyan-dim': '#06b6d4',
          amber: '#f59e0b',
          'amber-light': '#fbbf24',
          red: '#ef4444',
          'red-light': '#f87171',
          muted: '#8b9bb4',
        }
      },
      boxShadow: {
        'neon-green': '0 0 20px -3px rgba(0, 255, 135, 0.35)',
        'neon-green-sm': '0 0 10px -2px rgba(0, 255, 135, 0.3)',
        'neon-cyan': '0 0 20px -3px rgba(0, 240, 255, 0.35)',
        'neon-cyan-sm': '0 0 10px -2px rgba(0, 240, 255, 0.3)',
        'neon-amber': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'neon-red': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2.5s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
};
