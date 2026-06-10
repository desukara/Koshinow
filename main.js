document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.querySelector(".theme-icon");
  const year = document.getElementById("year");
  const navLinks = document.querySelectorAll(".site-nav .nav-link");
  const sectionLinks = document.querySelectorAll(
    '.site-nav .nav-link[href^="#"]'
  );

  const DESKTOP_WIDTH = 1024;

  function isDesktop() {
    return window.innerWidth >= DESKTOP_WIDTH;
  }

  function openMenu() {
    if (!menuToggle || !siteNav) return;

    siteNav.classList.add("active");
    menuToggle.classList.add("active");
    menuToggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!menuToggle || !siteNav) return;

    siteNav.classList.remove("active");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    if (!siteNav) return;

    if (siteNav.classList.contains("active")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function getStoredTheme() {
    try {
      const storedTheme = localStorage.getItem("theme");
      return storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : "dark";
    } catch {
      return "dark";
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // localStorage may be unavailable in private/restricted browsing.
    }
  }

  function applyTheme(theme) {
    const safeTheme = theme === "light" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", safeTheme);

    if (themeIcon) {
      themeIcon.textContent = safeTheme === "dark" ? "☾" : "☀";
    }

    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        safeTheme === "dark"
          ? "ライトモードに切り替え"
          : "ダークモードに切り替え"
      );

      themeToggle.setAttribute(
        "aria-pressed",
        safeTheme === "dark" ? "true" : "false"
      );
    }
  }

  function updateActiveNav() {
    const scrollPosition = window.scrollY + 140;

    sectionLinks.forEach((link) => {
      const sectionId = link.getAttribute("href");
      const section = sectionId ? document.querySelector(sectionId) : null;

      if (!section) return;

      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        navLinks.forEach((navLink) => navLink.classList.remove("active"));
        link.classList.add("active");
      }
    });

    if (window.scrollY < 80) {
      navLinks.forEach((navLink) => navLink.classList.remove("active"));

      const homeLink = document.querySelector(
        '.site-nav .nav-link[href="index.html"]'
      );
      if (homeLink) {
        homeLink.classList.add("active");
      }
    }
  }

  function debounce(callback, delay = 120) {
    let timeoutId;

    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (!isDesktop()) {
        closeMenu();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!menuToggle || !siteNav || isDesktop()) return;

    const clickedMenu = siteNav.contains(event.target);
    const clickedButton = menuToggle.contains(event.target);

    if (!clickedMenu && !clickedButton) {
      closeMenu();
    }
  });

  window.addEventListener(
    "resize",
    debounce(() => {
      if (isDesktop()) {
        closeMenu();
      }
    })
  );

  window.addEventListener("scroll", debounce(updateActiveNav, 80));

  const savedTheme = getStoredTheme();
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "dark";

      const newTheme = currentTheme === "dark" ? "light" : "dark";

      applyTheme(newTheme);
      storeTheme(newTheme);
    });
  }

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  updateActiveNav();
});
