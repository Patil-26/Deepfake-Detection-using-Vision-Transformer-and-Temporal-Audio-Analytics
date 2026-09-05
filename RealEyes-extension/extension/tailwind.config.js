/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./popup.html",
    "./src/popup/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deepBase: "#0a0a0f",
        deepCard: "#12121a",
        deepBorder: "#1e1e2e",
        deepRed: "#dc2626",
        deepGreen: "#22c55e",
        textMuted: "#6b7280",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      width: {
        popup: "380px",
      },
      minHeight: {
        popup: "500px",
      },
      animation: {
        "pulse-dot": "pulseDot 1.5s ease-in-out infinite",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
    },
  },
  plugins: [],
};
