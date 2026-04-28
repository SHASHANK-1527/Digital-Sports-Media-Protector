export default {
  content: ['./src/**/*.jsx', './src/**/*.js', './index.html'],
  theme: {
    extend: {
      colors: {
        'dap-bg': '#0F1115',
        'dap-primary': '#3A6EA5',
        'dap-accent': '#FFB020',
        'dap-danger': '#E5484D',
        'dap-success': '#4C9A6A',
        'dap-text-primary': '#E8EAF0',
        'dap-text-secondary': '#8A9BB0',
        'dap-border': '#1E2530',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'Monaco', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulse_ring: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink_cursor: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        radar: 'radar 3s linear infinite',
        'pulse-ring': 'pulse_ring 2s ease-out infinite',
        typewriter: 'typewriter 1.5s steps(40, end)',
        blink: 'blink_cursor 1s step-end infinite',
        scanline: 'scanline 2s linear infinite',
      },
    },
  },
  plugins: [],
}
