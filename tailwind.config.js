/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: '#070F0B',
          900: '#0A1612',
          800: '#0F1F18',
          700: '#152A21',
          600: '#1E3A2C',
          line: '#2A4535'
        },
        gold: {
          DEFAULT: '#E8B923',
          light: '#F4D35E',
          dark: '#A8820F'
        },
        live: '#E63946',
        floodlight: '#F5F3EA'
      },
      fontFamily: {
        display: ['"Anton"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      keyframes: {
        'card-in': {
          '0%': { opacity: 0, transform: 'translateY(40px) scale(0.92)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' }
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0px rgba(232,185,35,0.0)' },
          '50%': { boxShadow: '0 0 40px rgba(232,185,35,0.55)' }
        },
        'sweep': {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '100%': { transform: 'translateX(220%) skewX(-12deg)' }
        },
        'stamp-in': {
          '0%': { opacity: 0, transform: 'scale(2.4) rotate(-14deg)' },
          '60%': { opacity: 1, transform: 'scale(0.92) rotate(-6deg)' },
          '100%': { opacity: 1, transform: 'scale(1) rotate(-6deg)' }
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'ticker': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(110vh) rotate(540deg)', opacity: 0.2 }
        },
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'zoom-in': {
          '0%': { opacity: 0, transform: 'translateY(14px) scale(0.2)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' }
        }
      },
      animation: {
        'card-in': 'card-in 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'glow-pulse': 'glow-pulse 2.2s ease-in-out infinite',
        sweep: 'sweep 2.6s ease-in-out infinite',
        'stamp-in': 'stamp-in 0.55s cubic-bezier(0.16,1,0.3,1) both',
        'float-slow': 'float-slow 4s ease-in-out infinite',
        ticker: 'ticker 22s linear infinite',
        'confetti-fall': 'confetti-fall linear forwards',
        'zoom-in': 'zoom-in 0.1s ease-in-out both'
      }
    }
  },
  plugins: []
}
