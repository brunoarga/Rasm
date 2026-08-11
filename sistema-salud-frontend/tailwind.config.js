/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        crema: "#FDFBF7",
        pizarra: "#1E2124",
        "pizarra-card": "#2B2E33",
        "pizarra-border": "#3A3E44",
        "pizarra-950": "#131518",
        "pizarra-light": "#6C757D",
        "teal-medico": "#E07A5F",
        "teal-medico-dark": "#C8654B",
        "teal-medico-light": "#F4A261",
        ambar: "#D97706",
        "ambar-dark": "#B45309",
        terracota: "#B8452F",
        "terracota-light": "#F3D4CE",
        "terracota-dark": "#9B3B28",
        stone: "#E9E5DD",
        "stone-dark": "#D4C8B8",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      animation: {
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "fade-in-up": "fade-in-up 0.7s ease-out forwards",
        "fade-in": "fade-in 0.7s ease-out forwards",
        "pulse-sos": "pulse-sos 2.5s ease-in-out infinite",
        "slide-arrow": "slide-arrow 0.3s ease-in-out forwards",
        "morph": "morph 12s ease-in-out infinite",
        "morph-slow": "morph 18s ease-in-out infinite",
        "morph-slower": "morph 22s ease-in-out infinite",
        "bob": "bob 4s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.5s ease-out forwards",
        "slide-out-left": "slide-out-left 0.4s ease-in forwards",
        "accordion-open": "accordion-open 0.35s ease-out forwards",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-sos": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(184, 69, 47, 0.3)" },
          "50%": { boxShadow: "0 0 0 12px rgba(184, 69, 47, 0)" },
        },
        "slide-arrow": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(4px)" },
        },
        "morph": {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%", transform: "rotate(0deg)" },
          "33%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%", transform: "rotate(8deg)" },
          "66%": { borderRadius: "70% 30% 50% 50% / 40% 50% 60% 50%", transform: "rotate(-6deg)" },
        },
        "bob": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-out-left": {
          "0%": { opacity: "1", transform: "translateX(0)" },
          "100%": { opacity: "0", transform: "translateX(-40px)" },
        },
        "accordion-open": {
          "0%": { maxHeight: "0px", opacity: "0" },
          "100%": { maxHeight: "400px", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
