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
      boxShadow: {
        card: "0 4px 16px rgba(28, 15, 9, 0.08)",
        glow: "0 0 0 4px rgba(232, 93, 38, 0.2)",
        "glow-flame": "0 0 0 4px rgba(255, 122, 69, 0.25)",
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
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};
