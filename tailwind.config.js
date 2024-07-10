import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "selector",
  content: ["./src/**/*.{html,js,svelte,ts}"],
  safelist: ["dark"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    fontSize: {
      "5xl": "40px",
      "4xl": "32px",
      "3xl": "28px",
      "2xl": "24px",
      xl: "20px",
      lg: "18px",
      base: "16px",
      sm: "14px",
      xs: "12px",
      "2xs": "10px"
    },
    extend: {
      spacing: {
        2.5: "10px",
        7.5: "30px",
        15: "60px"
      },
      colors: {
        border: "rgb(var(--border) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)"
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      fontFamily: {
        sans: [...fontFamily.sans],
        orbitron: "Orbitron Variable"
      },
      animation: {
        "swing-in-top-fwd":
          "swing-in-top-fwd 0.5s cubic-bezier(0.175, 0.885, 0.320, 1.275) forwards",
        blink: "blink 0.6s ease both"
      },
      keyframes: {
        "swing-in-top-fwd": {
          "0%": {
            transform: "rotateX(-100deg)",
            "transform-origin": "top",
            opacity: "0"
          },
          to: {
            transform: "rotateX(0deg)",
            "transform-origin": "top",
            opacity: "1"
          }
        },
        blink: {
          "0%,50%,to": {
            opacity: "1"
          },
          "25%,75%": {
            opacity: "0"
          }
        }
      }
    }
  }
};

export default config;
