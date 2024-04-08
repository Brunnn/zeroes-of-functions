import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";
/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.vue"],
    theme: {
        extend: {
            fontFamily: {
                sans: [...defaultTheme.fontFamily.sans],
            },
        },
    },
    plugins: [
        forms,
    ],
};
