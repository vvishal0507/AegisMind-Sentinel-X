/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"]
      },
      colors: {
        obsidian: "#050816",
        panel: "rgba(14, 24, 42, 0.72)",
        cyanline: "#38bdf8",
        signal: "#14f195",
        amber: "#f59e0b",
        danger: "#ef4444"
      },
      boxShadow: {
        glow: "0 0 30px rgba(20, 241, 149, 0.18)",
        cyan: "0 0 26px rgba(56, 189, 248, 0.18)"
      },
      keyframes: {
        pulseRing: {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.04)" }
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" }
        }
      },
      animation: {
        "pulse-ring": "pulseRing 2.4s ease-in-out infinite",
        scan: "scan 4s linear infinite"
      }
    }
  },
  plugins: []
};
