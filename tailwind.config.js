/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Sinhala"', "system-ui", "sans-serif"],
        display: ['"Abhaya Libre"', '"Noto Sans Sinhala"', "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          950: "#050a14",
          900: "#08101f",
          850: "#0b1526",
          800: "#0e1b30",
          700: "#16263f",
        },
        aqua: {
          400: "#38e1c4",
          500: "#1cc9ae",
        },
        ember: "#f8b13c",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,225,196,0.18), 0 18px 50px -24px rgba(56,225,196,0.5)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(24px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up .35s ease-out both",
        "slide-in": "slide-in .3s ease-out both",
      },
    },
  },
  plugins: [],
};
