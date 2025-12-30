import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  // Important for Ant Design compatibility
  corePlugins: {
    preflight: false,
  },
} satisfies Config