import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle({ accentColor = "#C0392B" }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);

    if (nextIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="
        fixed bottom-6 left-6 z-50
        inline-flex items-center justify-center
        w-12 h-12 rounded-full
        border
        shadow-lg
        transition-all
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-offset-transparent
        backdrop-blur-md
      "
      // ✅ Márgenes (border) blanco/negro según ícono (sol/luna)
      style={{
        backgroundColor: isDark ? "rgba(16,17,20,0.88)" : "rgba(255,255,255,0.88)",
        borderColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)",
        boxShadow: `0 10px 30px rgba(0,0,0,0.18), 0 0 0 1px ${accentColor}22 inset`,
      }}
    >
      {/* Accent halo suave */}
      <span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(closest-side, ${accentColor}18, transparent 70%)`,
        }}
      />

      <span className="relative inline-flex items-center justify-center">
        {isDark ? (
          <Moon size={20} className="text-white" />
        ) : (
          <Sun size={20} className="text-black" />
        )}
      </span>
    </button>
  );
}
