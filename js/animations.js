(() => {
  const revealSelector =
    ".page-heading, .section-toolbar, .progress-card, .metric-card, .panel, .encouragement, .habit-card, .empty-state";
  const revealTimers = new WeakMap();
  const delayClasses = Array.from(
    { length: 7 },
    (_, index) => `reveal-delay-${index}`,
  );
  let initialized = false;
  let loading = false;
  let startedAt = 0;
  let finishTimer;
  let fallbackTimer;
  let loader;
  let main;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function clearReveals(section) {
    clearTimeout(revealTimers.get(section));
    section.querySelectorAll(".reveal-item").forEach((element) => {
      element.classList.remove("reveal-item", ...delayClasses);
    });
  }

  function animateSection(section) {
    if (!section || loading || !section.classList.contains("section--active"))
      return;
    clearReveals(section);
    if (prefersReducedMotion()) return;

    // Двигаем целую карточку; её вложенные элементы не анимируем повторно.
    const elements = [...section.querySelectorAll(revealSelector)].filter(
      (element) => !element.parentElement.closest(revealSelector),
    );
    void section.offsetWidth;
    elements.forEach((element, index) => {
      element.classList.add("reveal-item", delayClasses[Math.min(index, 6)]);
    });
    revealTimers.set(
      section,
      setTimeout(() => clearReveals(section), 800),
    );
  }

  function completeLoading() {
    if (!loading) return;
    loading = false;
    document.body.classList.remove("app-loading");
    clearTimeout(finishTimer);
    clearTimeout(fallbackTimer);
    main?.setAttribute("aria-busy", "false");
    if (loader) {
      if (prefersReducedMotion()) loader.hidden = true;
      else {
        loader.classList.add("app-loader--leaving");
        setTimeout(() => {
          loader.hidden = true;
          loader.classList.remove("app-loader--leaving");
        }, 180);
      }
    }
    animateSection(document.querySelector(".section--active"));
  }

  function initAnimations() {
    if (initialized) return;
    initialized = true;
    loading = true;
    document.body.classList.add("app-loading");
    startedAt = performance.now();
    loader = document.getElementById("app-loader");
    main = document.getElementById("main-content");
    main?.setAttribute("aria-busy", "true");
    if (loader) loader.hidden = false;

    // Даже при ошибке запуска индикатор не должен оставаться навсегда.
    fallbackTimer = setTimeout(completeLoading, 2500);
  }

  function finishLoading() {
    if (!loading || finishTimer !== undefined) return;
    const remaining = prefersReducedMotion()
      ? 0
      : Math.max(0, 350 - (performance.now() - startedAt));
    finishTimer = setTimeout(completeLoading, remaining);
  }

  window.HabitTracker.animations = {
    initAnimations,
    finishLoading,
    animateSection,
  };
})();
