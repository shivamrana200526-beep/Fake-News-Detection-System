import { useState, useEffect } from "react";
export function useTheme() {
    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem("satya-theme");
        if (stored === "dark" || stored === "light")
            return stored;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });
    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        }
        else {
            root.classList.remove("dark");
        }
        localStorage.setItem("satya-theme", theme);
    }, [theme]);
    const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    return { theme, toggle };
}
