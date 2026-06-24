import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Базовый фон и поверхности (почти чёрный, как в референсе)
        ink: {
          DEFAULT: "#0B0B0C",
          800: "#121214",
          700: "#161618",
          600: "#1C1C1F",
          500: "#242428",
        },
        // Неоновый лайм — фирменный акцент SELLIX
        lime: {
          DEFAULT: "#C7F503",
          bright: "#D4FF1A",
          dim: "#9CC000",
        },
        muted: "#8A8A92",
        line: "#26262B",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        bento: "28px",
        "bento-lg": "36px",
      },
      boxShadow: {
        bento: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -20px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(199,245,3,0.25), 0 12px 40px -8px rgba(199,245,3,0.35)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "lime-radial":
          "radial-gradient(circle at 50% 0%, rgba(199,245,3,0.18), transparent 60%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
