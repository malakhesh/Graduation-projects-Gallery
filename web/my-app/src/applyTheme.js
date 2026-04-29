// applyTheme.js
// Call initTheme() once at the top of your App.jsx (outside the component)

export function applyTheme(pref) {
  const root = document.documentElement;
  let dark = false;

  if (pref === "dark") {
    dark = true;
  } else if (pref === "light") {
    dark = false;
  } else if (pref === "auto") {
    const hour = new Date().getHours();
    dark = hour < 6 || hour >= 18; // dark 6pm–6am
  } else {
    // "system"
    dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  root.setAttribute("data-theme", dark ? "dark" : "light");
}

export function initTheme() {
  const saved = localStorage.getItem("gg-theme") || "system";
  applyTheme(saved);

  // Re-check every minute for "auto" mode (time crosses 6am or 6pm)
  setInterval(() => {
    const current = localStorage.getItem("gg-theme") || "system";
    if (current === "auto") applyTheme("auto");
  }, 60_000);

  // React to OS dark/light changes for "system" mode
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if ((localStorage.getItem("gg-theme") || "system") === "system") {
      applyTheme("system");
    }
  });
}