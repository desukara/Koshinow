document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.querySelector(".theme-icon");
  const year = document.getElementById("year");
  const siteHeader = document.querySelector(".site-header");
  const navLinks = document.querySelectorAll(".site-nav .nav-link");
  const sectionLinks = document.querySelectorAll(
    '.site-nav .nav-link[href^="#"]'
  );

  const DESKTOP_WIDTH = 1024;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let lastScrollY = window.scrollY;
  let ticking = false;

  function isDesktop() {
    return window.innerWidth >= DESKTOP_WIDTH;
  }

  function debounce(callback, delay = 120) {
    let timeoutId;

    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    };
  }

  function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
  }

  function injectEnhancementStyles() {
    if (document.getElementById("foxjin-js-enhancements")) return;

    const style = document.createElement("style");
    style.id = "foxjin-js-enhancements";

    style.textContent = `
      .js-progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 4px;
        z-index: 2000;
        pointer-events: none;
        background: linear-gradient(90deg, var(--vermillion), var(--gold-bright), var(--jade-bright));
        box-shadow: 0 0 14px rgba(255, 216, 107, 0.45);
        transition: width 0.08s linear;
      }

      .site-header {
        transition: box-shadow 0.24s ease, background 0.24s ease;
      }

      .site-header.js-header-active {
        box-shadow: 0 12px 38px rgba(0, 0, 0, 0.36), 0 0 22px rgba(216, 173, 47, 0.12);
      }

      .js-reveal {
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.35s ease, transform 0.35s ease;
        transition-delay: var(--reveal-delay, 0ms);
      }

      .js-reveal.is-visible {
        opacity: 1;
        transform: translateY(0);
      }

      .button,
      .theme-toggle,
      .menu-toggle {
        position: relative;
      }

      .button {
        will-change: transform;
      }

      .button.js-soft-press {
        transform: translateY(1px) scale(0.99);
      }

      .js-nav-indicator {
        position: fixed;
        height: 3px;
        width: 0;
        border-radius: 999px;
        z-index: 1600;
        pointer-events: none;
        opacity: 0;
        background: linear-gradient(90deg, var(--gold-bright), var(--gold));
        box-shadow: 0 0 12px rgba(255, 216, 107, 0.42);
        transition: transform 0.24s ease, width 0.24s ease, opacity 0.24s ease;
      }

      .email-modal.active {
        display: flex;
      }

      @media (prefers-reduced-motion: reduce) {
        .js-progress-bar,
        .site-header,
        .js-reveal,
        .js-nav-indicator,
        .button {
          transition: none !important;
          animation: none !important;
          transform: none !important;
        }

        .js-reveal {
          opacity: 1;
        }
      }
    `;

    document.head.appendChild(style);
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

  function setupYear() {
    if (year) {
      year.textContent = new Date().getFullYear();
    }
  }

  function setupMenu() {
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
        closeEmailModal();
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

        updateNavIndicator(
          document.querySelector(".site-nav .nav-link.active")
        );
      }, 120)
    );
  }

  function createProgressBar() {
    const existingBar = document.querySelector(".js-progress-bar");
    if (existingBar) return existingBar;

    const bar = document.createElement("div");
    bar.className = "js-progress-bar";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    return bar;
  }

  function updateProgressBar(bar) {
    if (!bar) return;

    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const progress =
      scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;

    bar.style.width = `${clamp(progress, 0, 100)}%`;
  }

  function updateHeaderState() {
    if (!siteHeader) return;

    siteHeader.classList.toggle("js-header-active", window.scrollY > 20);
    lastScrollY = window.scrollY;
  }

  function createNavIndicator() {
    const existingIndicator = document.querySelector(".js-nav-indicator");
    if (existingIndicator) return existingIndicator;

    const indicator = document.createElement("div");
    indicator.className = "js-nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    document.body.appendChild(indicator);
    return indicator;
  }

  const navIndicator = createNavIndicator();

  function updateNavIndicator(activeLink) {
    if (!navIndicator || !activeLink || !isDesktop()) {
      if (navIndicator) navIndicator.style.opacity = "0";
      return;
    }

    const rect = activeLink.getBoundingClientRect();

    navIndicator.style.width = `${rect.width}px`;
    navIndicator.style.transform = `translate3d(${rect.left}px, ${
      rect.bottom + 6
    }px, 0)`;
    navIndicator.style.opacity = "1";
  }

  function updateActiveNav() {
    const scrollPosition = window.scrollY + 150;
    let activeLink = null;

    sectionLinks.forEach((link) => {
      const sectionId = link.getAttribute("href");
      let section = null;

      try {
        section = sectionId ? document.querySelector(sectionId) : null;
      } catch {
        section = null;
      }

      if (!section) return;

      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        activeLink = link;
      }
    });

    if (!activeLink && window.scrollY < 80) {
      activeLink =
        document.querySelector('.site-nav .nav-link[aria-current="page"]') ||
        document.querySelector(".site-nav .nav-link.active") ||
        navLinks[0];
    }

    if (!activeLink) return;

    navLinks.forEach((navLink) => {
      const isActive = navLink === activeLink;
      navLink.classList.toggle("active", isActive);

      if (isActive) {
        navLink.setAttribute("aria-current", "page");
      } else {
        navLink.removeAttribute("aria-current");
      }
    });

    updateNavIndicator(activeLink);
  }

  function setupRevealAnimations() {
    const revealTargets = document.querySelectorAll(
      ".hero-content, .hero-visual, .content-section, .feature-card"
    );

    revealTargets.forEach((element, index) => {
      element.classList.add("js-reveal");
      element.style.setProperty(
        "--reveal-delay",
        `${Math.min(index * 35, 140)}ms`
      );
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -4% 0px",
      }
    );

    revealTargets.forEach((element) => observer.observe(element));
  }

  function setupButtonPressPolish() {
    document.querySelectorAll(".button").forEach((button) => {
      button.addEventListener("pointerdown", () => {
        button.classList.add("js-soft-press");
      });

      button.addEventListener("pointerup", () => {
        button.classList.remove("js-soft-press");
      });

      button.addEventListener("pointerleave", () => {
        button.classList.remove("js-soft-press");
      });

      button.addEventListener("blur", () => {
        button.classList.remove("js-soft-press");
      });
    });
  }

  function setupSmoothAnchorScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (!href || href === "#") return;

        let target = null;

        try {
          target = document.querySelector(href);
        } catch {
          return;
        }

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });

        history.pushState(null, "", href);

        if (!isDesktop()) {
          closeMenu();
        }
      });
    });
  }

  function setupEmailModalSupport() {
    const emailModal = document.getElementById("email-modal");
    const emailModalClose = document.getElementById("email-modal-close");
    const copyEmailBtn = document.getElementById("copy-email-btn");

    if (!emailModal) return;

    document.addEventListener("click", (event) => {
      const emailButton = event.target.closest(".email-choice-btn");

      if (emailButton) {
        event.preventDefault();
        openEmailModal();
        return;
      }

      if (event.target === emailModal) {
        closeEmailModal();
      }
    });

    if (emailModalClose) {
      emailModalClose.addEventListener("click", closeEmailModal);
    }

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
  }

  function openEmailModal() {
    const emailModal = document.getElementById("email-modal");
    if (!emailModal) return;

    emailModal.classList.add("active");
    emailModal.setAttribute("aria-hidden", "false");
  }

  function closeEmailModal() {
    const emailModal = document.getElementById("email-modal");
    const copyEmailBtn = document.getElementById("copy-email-btn");

    if (!emailModal) return;

    emailModal.classList.remove("active");
    emailModal.setAttribute("aria-hidden", "true");

    if (copyEmailBtn) {
      copyEmailBtn.textContent = "メールアドレスをコピー";
    }
  }

  function setupKonamiFoxMode() {
    const code = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];

    let position = 0;

    document.addEventListener("keydown", (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (key === code[position]) {
        position += 1;
      } else {
        position = key === code[0] ? 1 : 0;
      }

      if (position === code.length) {
        position = 0;
        activateFoxMode();
      }
    });
  }

  function activateFoxMode() {
    if (document.querySelector(".js-fox-mode-banner")) return;

    const banner = document.createElement("div");
    banner.className = "js-fox-mode-banner";
    banner.textContent = "🦊 FOX SPIRIT ACTIVATED";

    Object.assign(banner.style, {
      position: "fixed",
      left: "50%",
      bottom: "28px",
      transform: "translateX(-50%)",
      zIndex: "3000",
      padding: "14px 22px",
      borderRadius: "999px",
      fontWeight: "900",
      letterSpacing: "0.08em",
      color: "#17130f",
      background:
        "linear-gradient(135deg, var(--gold-bright), var(--gold), var(--gold-deep))",
      boxShadow:
        "0 0 24px rgba(255, 216, 107, 0.6), 0 16px 36px rgba(0, 0, 0, 0.28)",
    });

    document.body.appendChild(banner);

    setTimeout(() => {
      banner.style.transition = "opacity 0.35s ease";
      banner.style.opacity = "0";
    }, 1300);

    setTimeout(() => {
      banner.remove();
    }, 1750);
  }

  injectEnhancementStyles();

  const progressBar = createProgressBar();

  setupTheme();
  setupYear();
  setupMenu();
  setupRevealAnimations();
  setupButtonPressPolish();
  setupSmoothAnchorScrolling();
  setupEmailModalSupport();
  setupKonamiFoxMode();

  function onScrollFrame() {
    updateProgressBar(progressBar);
    updateHeaderState();
    updateActiveNav();
    ticking = false;
  }

  function requestScrollUpdate() {
    if (!ticking) {
      requestAnimationFrame(onScrollFrame);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });

  updateProgressBar(progressBar);
  updateHeaderState();
  updateActiveNav();
});
