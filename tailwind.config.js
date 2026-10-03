/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightBg: "#F8FAFC",
        panelBg: "#FFFFFF",
        cardBg: "#FFFFFF",
        borderLight: "#E2E8F0",
        tealAccent: "#00A3A6",
        tealHover: "#008C8F",
        tealLight: "#E6F4F1",
        slateDark: "#0F172A",
      },
      fontFamily: {
        display: ['Syne', '"Space Grotesk"', 'sans-serif'],
        serif: ['"Playfair Display"', '"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
