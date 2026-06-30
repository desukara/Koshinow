document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");
  const year = document.getElementById("year");
  const navLinks = document.querySelectorAll(".site-nav .nav-link");

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
    siteNav.classList.contains("active") ? closeMenu() : openMenu();
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
      if (!isDesktop()) closeMenu();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!menuToggle || !siteNav || isDesktop()) return;

    const clickedMenu = siteNav.contains(event.target);
    const clickedButton = menuToggle.contains(event.target);

    if (!clickedMenu && !clickedButton) closeMenu();
  });

  window.addEventListener(
    "resize",
    debounce(() => {
      if (isDesktop()) closeMenu();
    })
  );

  if (year) {
    year.textContent = new Date().getFullYear();
  }
});
