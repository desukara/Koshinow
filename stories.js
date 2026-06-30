document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.querySelector(".story-progress-bar");
  const storyContent = document.querySelector(".story-content");
  const tocLinks = document.querySelectorAll(".story-toc-list a");
  const copyButtons = document.querySelectorAll("[data-copy-link]");
  const shareButtons = document.querySelectorAll("[data-share-page]");

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updateReadingProgress() {
    if (!progressBar || !storyContent) return;

    const rect = storyContent.getBoundingClientRect();
    const contentTop = window.scrollY + rect.top;
    const contentHeight = storyContent.offsetHeight;
    const viewportHeight = window.innerHeight;

    const start = contentTop - viewportHeight * 0.25;
    const end = contentTop + contentHeight - viewportHeight * 0.75;

    if (end <= start) {
      progressBar.style.width = "0%";
      return;
    }

    const progress = clamp((window.scrollY - start) / (end - start), 0, 1);
    progressBar.style.width = `${progress * 100}%`;
  }

  function updateActiveToc() {
    if (!tocLinks.length) return;

    let activeLink = null;

    tocLinks.forEach((link) => {
      const targetId = link.getAttribute("href");
      if (!targetId || !targetId.startsWith("#")) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      if (target.getBoundingClientRect().top <= 155) {
        activeLink = link;
      }
    });

    tocLinks.forEach((link) => link.classList.remove("active"));

    if (activeLink) {
      activeLink.classList.add("active");
    }
  }

  function updateStoryState() {
    updateReadingProgress();
    updateActiveToc();
  }

  function flashButtonText(button, message) {
    const originalText = button.textContent;
    button.textContent = message;

    window.setTimeout(() => {
      button.textContent = originalText;
    }, 1600);
  }

  async function copyCurrentUrl(button) {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flashButtonText(button, "Link copied");
    } catch {
      flashButtonText(button, "Copy failed");
    }
  }

  function sharePage(button) {
    if (navigator.share) {
      navigator
        .share({
          title: document.title,
          url: window.location.href,
        })
        .catch(() => {});
      return;
    }

    copyCurrentUrl(button);
  }

  copyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      copyCurrentUrl(button);
    });
  });

  shareButtons.forEach((button) => {
    button.addEventListener("click", () => {
      sharePage(button);
    });
  });

  tocLinks.forEach((link) => {
    link.addEventListener("click", () => {
      tocLinks.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  window.addEventListener("scroll", updateStoryState, { passive: true });
  window.addEventListener("resize", updateStoryState);

  updateStoryState();
});
