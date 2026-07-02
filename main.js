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

  function openMenu() {
    if (!menuToggle || !siteNav) return;

    siteNav.classList.add("active");
    menuToggle.classList.add("active");
    menuToggle.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("menu-is-open");
  }

  function closeMenu() {
    if (!menuToggle || !siteNav) return;

    siteNav.classList.remove("active");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("menu-is-open");
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
        box-shadow: 0 0 18px rgba(255, 216, 107, 0.65);
        transition: width 0.08s linear;
      }

      .site-header {
        transition: transform 0.34s ease, box-shadow 0.34s ease, background 0.34s ease;
      }

      .site-header.js-header-hidden {
        transform: translateY(-105%);
      }

      .site-header.js-header-active {
        box-shadow: 0 12px 42px rgba(0, 0, 0, 0.42), 0 0 28px rgba(216, 173, 47, 0.14);
      }

      .menu-is-open .site-header {
        transform: translateY(0);
      }

      .js-reveal {
        opacity: 0;
        transform: translateY(26px) scale(0.985);
        filter: blur(8px);
        transition:
          opacity 0.8s ease,
          transform 0.8s ease,
          filter 0.8s ease;
        transition-delay: var(--reveal-delay, 0ms);
      }

      .js-reveal.is-visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }

      .button,
      .theme-toggle,
      .menu-toggle,
      .lang-link,
      .nav-link {
        position: relative;
        overflow: hidden;
      }

      .button::after,
      .theme-toggle::after,
      .menu-toggle::after {
        content: "";
        position: absolute;
        inset: -2px;
        opacity: 0;
        pointer-events: none;
        background: radial-gradient(
          circle at var(--glow-x, 50%) var(--glow-y, 50%),
          rgba(255, 216, 107, 0.52),
          transparent 34%
        );
        transition: opacity 0.25s ease;
      }

      .button:hover::after,
      .theme-toggle:hover::after,
      .menu-toggle:hover::after {
        opacity: 1;
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
        box-shadow: 0 0 14px rgba(255, 216, 107, 0.55);
        transition:
          transform 0.3s ease,
          width 0.3s ease,
          opacity 0.3s ease;
      }

      .js-particle-field {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .js-kami-particle {
        position: absolute;
        width: var(--particle-size, 5px);
        height: var(--particle-size, 5px);
        left: var(--particle-left, 50%);
        top: 110%;
        border-radius: 999px;
        opacity: 0;
        background: rgba(255, 216, 107, 0.62);
        box-shadow: 0 0 14px rgba(255, 216, 107, 0.52);
        animation: foxjinParticleFloat var(--particle-speed, 18s) linear infinite;
        animation-delay: var(--particle-delay, 0s);
      }

      @keyframes foxjinParticleFloat {
        0% {
          opacity: 0;
          transform: translate3d(0, 0, 0) scale(0.8);
        }

        12% {
          opacity: 0.65;
        }

        70% {
          opacity: 0.42;
        }

        100% {
          opacity: 0;
          transform: translate3d(var(--particle-drift, 30px), -125vh, 0) scale(1.2);
        }
      }

      .js-page-fade {
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.38s ease, transform 0.38s ease;
      }

      .js-page-ready {
        opacity: 1;
        transform: translateY(0);
      }

      .js-page-exit {
        opacity: 0;
        transform: translateY(-8px);
      }

      @media (prefers-reduced-motion: reduce) {
        .js-progress-bar,
        .site-header,
        .js-reveal,
        .js-nav-indicator,
        .js-page-fade,
        .js-page-ready,
        .js-page-exit {
          transition: none !important;
          animation: none !important;
          transform: none !important;
          filter: none !important;
        }

        .js-reveal {
          opacity: 1;
        }

        .js-particle-field {
          display: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createProgressBar() {
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

    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    const pastHero = currentScrollY > 180;

    siteHeader.classList.toggle("js-header-active", currentScrollY > 20);

    if (
      scrollingDown &&
      pastHero &&
      !siteNav?.classList.contains("active") &&
      !document.activeElement?.closest(".site-header")
    ) {
      siteHeader.classList.add("js-header-hidden");
    } else {
      siteHeader.classList.remove("js-header-hidden");
    }

    lastScrollY = currentScrollY;
  }

  function updateActiveNav() {
    const scrollPosition = window.scrollY + 150;
    let activeLink = null;

    sectionLinks.forEach((link) => {
      const sectionId = link.getAttribute("href");
      const section = sectionId ? document.querySelector(sectionId) : null;

      if (!section) return;

      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        activeLink = link;
      }
    });

    if (window.scrollY < 80) {
      activeLink =
        document.querySelector('.site-nav .nav-link[href="index-en.html"]') ||
        document.querySelector('.site-nav .nav-link[href="index.html"]') ||
        navLinks[0];
    }

    if (activeLink) {
      navLinks.forEach((navLink) => {
        navLink.classList.toggle("active", navLink === activeLink);
        if (navLink === activeLink) {
          navLink.setAttribute("aria-current", "page");
        } else {
          navLink.removeAttribute("aria-current");
        }
      });

      updateNavIndicator(activeLink);
    }
  }

  function createNavIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "js-nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    document.body.appendChild(indicator);
    return indicator;
  }

  let navIndicator = null;

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

  function setupRevealAnimations() {
    const revealTargets = document.querySelectorAll(
      ".hero-content, .hero-visual, .content-section, .feature-card, .contact-cta-section"
    );

    revealTargets.forEach((element, index) => {
      element.classList.add("js-reveal");
      element.style.setProperty(
        "--reveal-delay",
        `${Math.min(index * 55, 260)}ms`
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
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealTargets.forEach((element) => observer.observe(element));
  }

  function setupGlowTracking() {
    const glowTargets = document.querySelectorAll(
      ".button, .theme-toggle, .menu-toggle"
    );

    glowTargets.forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        element.style.setProperty("--glow-x", `${x}%`);
        element.style.setProperty("--glow-y", `${y}%`);
      });
    });
  }

  function setupParticles() {
    if (prefersReducedMotion) return;

    const particleField = document.createElement("div");
    particleField.className = "js-particle-field";
    particleField.setAttribute("aria-hidden", "true");

    const particleCount = isDesktop() ? 28 : 14;

    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement("span");
      particle.className = "js-kami-particle";

      const size = Math.random() * 4 + 2;
      const left = Math.random() * 100;
      const drift = Math.random() * 90 - 45;
      const speed = Math.random() * 12 + 14;
      const delay = Math.random() * -24;

      particle.style.setProperty("--particle-size", `${size}px`);
      particle.style.setProperty("--particle-left", `${left}%`);
      particle.style.setProperty("--particle-drift", `${drift}px`);
      particle.style.setProperty("--particle-speed", `${speed}s`);
      particle.style.setProperty("--particle-delay", `${delay}s`);

      particleField.appendChild(particle);
    }

    document.body.prepend(particleField);
  }

  function setupSmoothAnchorScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (!href || href === "#") return;

        const target = document.querySelector(href);

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

  function setupPageTransitions() {
    if (prefersReducedMotion) return;

    document.body.classList.add("js-page-fade");

    requestAnimationFrame(() => {
      document.body.classList.add("js-page-ready");
    });

    document.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (
          !href ||
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          href.startsWith("http") ||
          link.target === "_blank" ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        event.preventDefault();
        document.body.classList.add("js-page-exit");

        setTimeout(() => {
          window.location.href = href;
        }, 220);
      });
    });
  }

  function setupKeyboardControls() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  function setupOutsideClickClose() {
    document.addEventListener("click", (event) => {
      if (!menuToggle || !siteNav || isDesktop()) return;

      const clickedMenu = siteNav.contains(event.target);
      const clickedButton = menuToggle.contains(event.target);

      if (!clickedMenu && !clickedButton) {
        closeMenu();
      }
    });
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

    window.addEventListener(
      "resize",
      debounce(() => {
        if (isDesktop()) {
          closeMenu();
        }

        const activeLink = document.querySelector(".site-nav .nav-link.active");
        updateNavIndicator(activeLink);
      }, 120)
    );
  }

  function setupTheme() {
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
  }

  function setupYear() {
    if (year) {
      year.textContent = new Date().getFullYear();
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
        "0 0 28px rgba(255, 216, 107, 0.75), 0 16px 40px rgba(0, 0, 0, 0.35)",
    });

    document.body.appendChild(banner);

    setTimeout(() => {
      banner.style.transition = "opacity 0.45s ease, transform 0.45s ease";
      banner.style.opacity = "0";
      banner.style.transform = "translateX(-50%) translateY(12px)";
    }, 1600);

    setTimeout(() => {
      banner.remove();
    }, 2200);
  }

  const progressBar = createProgressBar();

  injectEnhancementStyles();
  setupTheme();
  setupYear();
  setupMenu();
  setupKeyboardControls();
  setupOutsideClickClose();
  setupRevealAnimations();
  setupGlowTracking();
  setupParticles();
  setupSmoothAnchorScrolling();
  setupPageTransitions();
  setupKonamiFoxMode();

  navIndicator = createNavIndicator();

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
