(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reducedMotion.matches) {
    document.documentElement.classList.add("motion-reduced");
    return;
  }

  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const revealSelectors = [
    ".section-intro",
    ".telemetry article",
    ".discipline-card",
    ".leadership-band",
    ".experience-card",
    ".impact-list article",
    ".coverage-grid article",
    ".project-card",
    ".writing-list a",
    ".contact > *",
    ".case-panel",
    ".article-catalogue > a"
  ];

  root.classList.add("motion-ready");

  document.querySelectorAll(revealSelectors.join(",")).forEach((element, index) => {
    element.dataset.reveal = "";
    element.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10%", threshold: 0.08 });

  document.querySelectorAll("[data-reveal]").forEach((element) => {
    revealObserver.observe(element);
  });

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const element = entry.target;
      const original = element.textContent.trim();
      const numericParts = original.match(/\d+/g);

      if (!numericParts || numericParts.length !== 1) {
        observer.unobserve(element);
        return;
      }

      const target = Number(numericParts[0]);
      const parts = original.match(/^(\D*)(\d+)(.*)$/);
      if (!parts || target === 0) {
        observer.unobserve(element);
        return;
      }

      const [, prefix, , suffix] = parts;
      const duration = 1200;
      const startedAt = performance.now();
      element.setAttribute("aria-label", original);

      const tick = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      observer.unobserve(element);
    });
  }, { threshold: 0.55 });

  document.querySelectorAll(".telemetry strong").forEach((element) => {
    counterObserver.observe(element);
  });

  let framePending = false;
  const updateScrollState = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    root.style.setProperty("--scroll-progress", Math.min(Math.max(progress, 0), 1));
    header?.classList.toggle("is-scrolled", window.scrollY > 16);
    framePending = false;
  };

  window.addEventListener("scroll", () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(updateScrollState);
  }, { passive: true });

  updateScrollState();
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("page-ready")));
})();
