"use client";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Fonction pour appliquer le thème
    const applyTheme = (theme: string) => {
      const root = document.documentElement;

      // Supprimer toutes les classes de thème existantes
      root.classList.remove("light", "dark");

      // Appliquer la nouvelle classe de thème
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }

      // Forcer la couleur de base du body
      document.body.style.backgroundColor = "var(--background)";
      document.body.style.color = "var(--foreground)";
    };

    // Initialiser le thème au chargement
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    // Écouter les changements de préférence système
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      const currentTheme = localStorage.getItem("theme");
      if (currentTheme === "system" || !currentTheme) {
        applyTheme("system");
      }
    };

    // Ajouter l'écouteur d'événement
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    // Nettoyer à la fin
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  // Éviter le flash de contenu sans style
  useEffect(() => {
    // Supprimer le style de chargement si présent
    const loadingStyle = document.getElementById("loading-styles");
    if (loadingStyle) {
      loadingStyle.remove();
    }
  }, []);

  return <div className="theme-transition">{children}</div>;
}
