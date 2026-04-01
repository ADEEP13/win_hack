import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'agri-green': '#2d5016',
        'agri-gold': '#d4a574',
      },
    },
  },
  plugins: [],
}
export default config
