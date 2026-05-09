

export function applyTheme(pref) {
  const root = document.documentElement;
  let theme = "light";

  if (pref === "dark") {
    theme = "dark";
  } else if (pref === "light") {
    theme = "light";
  } else if (pref === "caramel") {
    theme = "caramel";
  } else if (pref === "auto") {
    const hour = new Date().getHours();
    theme = (hour < 6 || hour >= 18) ? "dark" : "light";
  } else {
    // "system"
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  root.setAttribute("data-theme", theme);
}

export function initTheme() {
  const saved = localStorage.getItem("gg-theme") || "system";
  applyTheme(saved);

  setInterval(() => {
    const current = localStorage.getItem("gg-theme") || "system";
    if (current === "auto") applyTheme("auto");
  }, 60_000);

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if ((localStorage.getItem("gg-theme") || "system") === "system") {
      applyTheme("system");
    }
  });
}