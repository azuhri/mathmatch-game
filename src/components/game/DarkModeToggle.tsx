import { useEffect, useState } from "react";

export function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="fixed top-4 right-4 z-50 text-2xl p-2 rounded-xl bg-card border-2 border-border hover:scale-110 transition-transform shadow-md"
      aria-label="Toggle dark mode"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
