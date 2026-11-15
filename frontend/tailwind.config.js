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
          darkest: '#05080a',    // Deepest black-green background
          dark: '#070b0e',       // Main page background
          surface: '#0c1319',    // Clean matte dark surface with subtle green tint
          card: '#101921',       // Sleek card background
          'card-hover': '#14202b',
          border: '#1a2733',     // Sleek subtle border
          'border-light': '#243545',
          neon: '#00ff87',       // Glowing neon green
          'neon-dim': '#05d972',
          cyan: '#00f0ff',       // Glowing neon cyan
          'cyan-dim': '#06b6d4',
          amber: '#f59e0b',      // Amber for moderate / reserve
          'amber-light': '#fbbf24',
          red: '#ef4444',        // Red for constrained
          'red-light': '#f87171',
          muted: '#7e92a2',      // Clean muted slate
        }
      },
      boxShadow: {
        'neon-green': '0 0 16px -2px rgba(0, 255, 135, 0.3)',
        'neon-green-sm': '0 0 8px -1px rgba(0, 255, 135, 0.25)',
        'neon-cyan': '0 0 16px -2px rgba(0, 240, 255, 0.3)',
        'neon-cyan-sm': '0 0 8px -1px rgba(0, 240, 255, 0.25)',
        'neon-amber': '0 0 16px -2px rgba(245, 158, 11, 0.3)',
        'neon-red': '0 0 16px -2px rgba(239, 68, 68, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
