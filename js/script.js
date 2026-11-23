(() => {
  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("site-nav");
  const navToggle = document.getElementById("nav-toggle");
  const themeToggle = document.getElementById("theme-toggle");
  const themeColor = document.getElementById("theme-color");
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const storageKey = "alomory-theme";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const getStoredTheme = () => {
    try {
      const value = localStorage.getItem(storageKey);
      return value === "light" || value === "dark" ? value : null;
    } catch (error) {
      return null;
    }
  };

  const storeTheme = (value) => {
    try {
      localStorage.setItem(storageKey, value);
    } catch (error) {
      /* ignore storage errors */
    }
  };

  const applyTheme = (theme, persist) => {
    root.dataset.theme = theme;
    if (persist) storeTheme(theme);
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
    if (themeColor) {
      themeColor.setAttribute("content", theme === "dark" ? "#0f0f0e" : "#f6f4ee");
    }
  };

  applyTheme(root.dataset.theme === "dark" ? "dark" : "light", false);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });
  }

  const handleSystemChange = (event) => {
    if (!getStoredTheme()) {
      applyTheme(event.matches ? "dark" : "light", false);
    }
  };

  if (media.addEventListener) {
    media.addEventListener("change", handleSystemChange);
  } else if (media.addListener) {
    media.addListener(handleSystemChange);
  }

  // Mobile navigation
  let navOpen = false;

  const setNav = (open) => {
    navOpen = open;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  };

  if (navToggle) {
    navToggle.addEventListener("click", () => setNav(!navOpen));
  }

  if (nav) {
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setNav(false);
    });
  }

  document.addEventListener("click", (event) => {
    if (navOpen && header && !header.contains(event.target)) {
      setNav(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navOpen) {
      setNav(false);
      if (navToggle) navToggle.focus();
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 881px)");
  const onDesktop = (event) => {
    if (event.matches) setNav(false);
  };

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener("change", onDesktop);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(onDesktop);
  }

  // Scroll spy
  const navLinks = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  const hero = document.querySelector(".hero");

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target === hero) {
            navLinks.forEach((link) => {
              link.classList.remove("is-active");
              link.removeAttribute("aria-current");
            });
            return;
          }
          navLinks.forEach((link) => {
            const active = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("is-active", active);
            if (active) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    if (hero) spy.observe(hero);
    sections.forEach((section) => spy.observe(section));
  }

  // Reveal animations
  const revealElements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || reducedMotion.matches) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }
})();
