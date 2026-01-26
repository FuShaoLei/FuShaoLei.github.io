(() => {
  const storageKey = "inkpress-theme";
  const root = document.documentElement;
  const body = document.body;
  const themeList = (body.dataset.themeList || "day,night").split(",").map((s) => s.trim()).filter(Boolean);
  const labels = {
    day: "日",
    night: "夜",
    sepia: "褐"
  };

  const toggle = document.querySelector("[data-theme-toggle]");
  const label = document.querySelector("[data-theme-label]");

  function labelFor(theme) {
    return labels[theme] || theme;
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(storageKey, theme);
    if (label) {
      label.textContent = labelFor(theme);
    }
  }

  function nextTheme() {
    const current = root.getAttribute("data-theme") || themeList[0];
    const index = themeList.indexOf(current);
    const nextIndex = index >= 0 ? (index + 1) % themeList.length : 0;
    apply(themeList[nextIndex]);
  }

  if (toggle) {
    toggle.addEventListener("click", nextTheme);
  }

  const current = root.getAttribute("data-theme") || themeList[0];
  apply(current);

  const tocSidebar = document.querySelector(".toc-sidebar");
  const tocNav = document.querySelector(".toc-body nav");
  const tocLinks = tocNav ? Array.from(tocNav.querySelectorAll("a")) : [];
  const tocItems = tocLinks
    .map((link) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return null;
      const id = decodeURIComponent(href.slice(1));
      const heading = document.getElementById(id);
      if (!heading) return null;
      return { heading, link };
    })
    .filter(Boolean);

  function updateTocTop() {
    if (!tocSidebar) return;
    const header = document.querySelector(".site-header");
    const main = document.querySelector(".site-main");
    let top = 0;
    if (header) {
      top += header.getBoundingClientRect().height;
    }
    if (main) {
      const paddingTop = parseFloat(getComputedStyle(main).paddingTop) || 0;
      top += paddingTop;
    }
    const scrolled = window.scrollY > 0;
    const targetTop = scrolled ? 16 : top;
    root.style.setProperty("--toc-top", `${Math.round(targetTop)}px`);
  }

  function updateTocActive() {
    if (!tocItems.length) return;
    const scrollPosition = window.scrollY + 20;
    let current = tocItems[0];
    for (const item of tocItems) {
      if (scrollPosition >= item.heading.offsetTop) {
        current = item;
      } else {
        break;
      }
    }
    tocLinks.forEach((link) => link.classList.remove("active"));
    if (current) {
      current.link.classList.add("active");
    }
  }

  updateTocTop();
  updateTocActive();
  window.addEventListener("resize", updateTocTop);
  window.addEventListener("resize", updateTocActive);
  window.addEventListener("load", updateTocActive);
  window.addEventListener("scroll", () => {
    updateTocTop();
    updateTocActive();
  }, { passive: true });
})();

