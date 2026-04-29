/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1C0F09",
          muted: "rgba(28, 15, 9, 0.72)",
          soft: "rgba(28, 15, 9, 0.56)",
          faint: "rgba(28, 15, 9, 0.12)",
        },
        paper: {
          DEFAULT: "#F7F3EE",
          muted: "#EFE9E1",
        },
        smoke: {
          DEFAULT: "#C8BFB5",
          soft: "#D9D2C8",
        },
        orange: {
          DEFAULT: "#E85D26",
          hover: "#D14F1C",
          active: "#B8431A",
          soft: "rgba(232, 93, 38, 0.12)",
        },
        flame: {
          DEFAULT: "#FF7A45",
          hover: "#F26A35",
        },
        amber: {
          DEFAULT: "#FFB347",
          hover: "#F2A133",
        },
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        script: ["Caveat", "cursive"],
      },
      backdropBlur: {
        overlay: "24px",
      },
      boxShadow: {
        card: "0 4px 16px rgba(28, 15, 9, 0.08)",
        glow: "0 0 0 4px rgba(232, 93, 38, 0.2)",
        "glow-flame": "0 0 0 4px rgba(255, 122, 69, 0.25)",
        "glow-soft": "0 12px 48px -12px rgba(232, 93, 38, 0.45)",
        overlay:
          "0 24px 64px rgba(28, 15, 9, 0.32), inset 0 1px 0 rgba(247, 243, 238, 0.06)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #E85D26 0%, #FF7A45 55%, #FFB347 100%)",
        "ink-gradient": "linear-gradient(180deg, #1C0F09 0%, #2A1810 100%)",
        "paper-gradient": "linear-gradient(180deg, #F7F3EE 0%, #EFE9E1 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up-lg": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        sheen: {
          "0%": { opacity: "0", transform: "translateX(-30%) skewX(-20deg)" },
          "20%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateX(120%) skewX(-20deg)" },
        },
        shine: {
          "0%": { transform: "translateX(-120%) skewX(-20deg)", opacity: "0" },
          "20%": { opacity: "0.6" },
          "100%": { transform: "translateX(220%) skewX(-20deg)", opacity: "0" },
        },
        "caret-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "orbit-slow-cw": {
          "0%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(40px, -20px)" },
          "50%": { transform: "translate(60px, 20px)" },
          "75%": { transform: "translate(20px, 40px)" },
          "100%": { transform: "translate(0, 0)" },
        },
        "orbit-slow-ccw": {
          "0%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(-30px, 30px)" },
          "50%": { transform: "translate(-60px, -10px)" },
          "75%": { transform: "translate(-20px, -40px)" },
          "100%": { transform: "translate(0, 0)" },
        },
        breath: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.06)" },
        },
        "glow-pulse": {
          "0%, 100%": { textShadow: "0 0 0 rgba(232,93,38,0)" },
          "50%": { textShadow: "0 0 28px rgba(232,93,38,0.45)" },
        },
        "draw-line": {
          "0%": { strokeDashoffset: "200" },
          "100%": { strokeDashoffset: "0" },
        },
        "dot-cascade": {
          "0%, 80%, 100%": { opacity: "0.25", transform: "translateY(0)" },
          "40%": { opacity: "1", transform: "translateY(-3px)" },
        },
        "scroll-progress": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-up-lg": "fade-up-lg 800ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        sheen: "sheen 900ms ease-out both",
        shine: "shine 1100ms ease-out",
        "caret-blink": "caret-blink 800ms steps(2, end) infinite",
        "orbit-slow-cw": "orbit-slow-cw 28s ease-in-out infinite",
        "orbit-slow-ccw": "orbit-slow-ccw 32s ease-in-out infinite",
        breath: "breath 8s ease-in-out infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "draw-line": "draw-line 1500ms ease-out both",
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};
