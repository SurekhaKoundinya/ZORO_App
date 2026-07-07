import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E8CC6A",
          dark: "#C9A227",
          muted: "#D4AF3720",
        },
        dark: {
          DEFAULT: "#0B0B0B",
          card: "#111111",
          border: "#1E1E1E",
        },
        charcoal: "#1A1A1A",
        success: "#16C784",
        danger: "#EF4444",
        warning: "#FACC15",
        zinc: {
          850: "#1A1A1A",
          950: "#0B0B0B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        gold: "0 0 30px rgba(212,175,55,0.15)",
        "gold-sm": "0 0 15px rgba(212,175,55,0.1)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.6)",
        glass: "0 8px 32px rgba(0,0,0,0.3)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #C9A227 50%, #B8941C 100%)",
        "gold-subtle": "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)",
        "dark-gradient": "linear-gradient(135deg, #1A1A1A 0%, #111111 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(212,175,55,0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(212,175,55,0.4)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
