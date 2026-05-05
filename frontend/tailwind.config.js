/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                ink: "#0a0a0f",
                panel: "#13131a",
                accent: "#2B97C7"
            },
            fontFamily: {
                display: ["'Space Grotesk'", "system-ui", "sans-serif"],
                body: ["'Space Grotesk'", "system-ui", "sans-serif"]
            },
            boxShadow: {
                glow: "0 0 30px rgba(43, 151, 199, 0.35)"
            }
        }
    },
    plugins: []
};
