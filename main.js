document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.querySelector(".theme-icon");
  const year = document.getElementById("year");

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

      if (storedTheme === "light" || storedTheme === "dark") {
        return storedTheme;
      }

      return "dark";
    } catch {
      return "dark";
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // localStorage may be unavailable.
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

  function setupTheme() {
    applyTheme(getStoredTheme());

    if (!themeToggle) return;

    themeToggle.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "dark";

      const newTheme = currentTheme === "dark" ? "light" : "dark";

      applyTheme(newTheme);
      storeTheme(newTheme);
    });
  }

  function setupMenu() {
    if (menuToggle && siteNav) {
      menuToggle.addEventListener("click", toggleMenu);
    }

    document.querySelectorAll(".site-nav .nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (!isDesktop()) {
          closeMenu();
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!menuToggle || !siteNav || isDesktop()) return;

      const clickedMenu = siteNav.contains(event.target);
      const clickedButton = menuToggle.contains(event.target);

      if (!clickedMenu && !clickedButton) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (isDesktop()) {
        closeMenu();
      }
    });
  }

  function setupActivePageNav() {
    const currentFile =
      window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".site-nav .nav-link").forEach((link) => {
      const linkFile = link.getAttribute("href");

      if (!linkFile || linkFile.startsWith("#")) return;

      const isActive = linkFile === currentFile;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function setupYear() {
    if (year) {
      year.textContent = new Date().getFullYear();
    }
  }

  function setupEmailModal() {
    const emailModal = document.getElementById("email-modal");
    const emailModalClose = document.getElementById("email-modal-close");
    const copyEmailBtn = document.getElementById("copy-email-btn");
    const emailChoiceBtns = document.querySelectorAll(".email-choice-btn");

    if (!emailModal) return;

    function openEmailModal() {
      emailModal.classList.add("active");
      emailModal.setAttribute("aria-hidden", "false");
    }

    function closeEmailModal() {
      emailModal.classList.remove("active");
      emailModal.setAttribute("aria-hidden", "true");

      if (copyEmailBtn) {
        copyEmailBtn.textContent = "メールアドレスをコピー";
      }
    }

    emailChoiceBtns.forEach((button) => {
      button.addEventListener("click", openEmailModal);
    });

    if (emailModalClose) {
      emailModalClose.addEventListener("click", closeEmailModal);
    }

    emailModal.addEventListener("click", (event) => {
      if (event.target === emailModal) {
        closeEmailModal();
      }
    });

    if (copyEmailBtn) {
      copyEmailBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText("info@foxjin.com");
          copyEmailBtn.textContent = "コピーしました";
        } catch {
          copyEmailBtn.textContent = "info@foxjin.com";
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeEmailModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  setupTheme();
  setupMenu();
  setupActivePageNav();
  setupYear();
  setupEmailModal();
});
