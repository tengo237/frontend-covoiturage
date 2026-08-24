/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Identité RIDE+ — option B : terre cuite + teal, fond clair chaleureux.
        creme: "#FBF6EF",
        brun: {
          DEFAULT: "#3D2B1F",
          muted: "#8C7A6B",
        },
        terre: {
          50: "#FAECE7",
          400: "#F0997B",
          600: "#D85A30",
          700: "#B84420",
        },
        teal: {
          50: "#E1F5EE",
          400: "#5DCAA5",
          600: "#0F6E56",
          700: "#0B5342",
        },
        // Conservés pour compatibilité avec le code existant.
        primary: {
          50: "#FAECE7",
          100: "#F0997B",
          400: "#E37D53",
          600: "#D85A30",
          800: "#3D2B1F",
        },
        danger: {
          50: "#FCEBEB",
          400: "#E24B4A",
          600: "#A32D2D",
        },
        success: {
          50: "#E1F5EE",
          400: "#5DCAA5",
          600: "#0F6E56",
        },
      },
      fontFamily: {
        display: ["Sora_600SemiBold"],
        "display-bold": ["Sora_700Bold"],
        body: ["Manrope_400Regular"],
        "body-medium": ["Manrope_500Medium"],
        "body-semibold": ["Manrope_600SemiBold"],
      },
      screens: {
        sm: "380px",
        md: "600px",
        lg: "900px",
      },
    },
  },
  plugins: [],
};
