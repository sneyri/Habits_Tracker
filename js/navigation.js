(() => {
  function initNavigation() {
    const sections = document.querySelectorAll(".section");
    const buttons = document.querySelectorAll(".nav__button");

    function showSection(sectionId, focus = false) {
      if (![...sections].some((section) => section.id === sectionId)) return;
      sections.forEach((section) =>
        section.classList.toggle("section--active", section.id === sectionId),
      );
      buttons.forEach((button) => {
        const active = button.dataset.section === sectionId;
        button.classList.toggle("nav__button--active", active);
        if (active) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      });
      if (focus) {
        document.getElementById("main-content").focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    }

    document.addEventListener("click", (event) => {
      if (event.target.closest(".skip-link")) {
        event.preventDefault();
        document.getElementById("main-content").focus();
        return;
      }
      const button = event.target.closest("[data-section]");
      if (!button) return;
      event.preventDefault();
      const sectionId = button.dataset.section;
      if (location.hash !== `#${sectionId}` && location.protocol === "file:") {
        location.hash = sectionId;
        return;
      }
      if (location.hash !== `#${sectionId}`)
        history.pushState(null, "", `#${sectionId}`);
      showSection(sectionId, true);
    });
    window.addEventListener("hashchange", () =>
      showSection(location.hash.slice(1) || "dashboard", true),
    );
    window.addEventListener("popstate", () =>
      showSection(location.hash.slice(1) || "dashboard", true),
    );
    showSection(location.hash.slice(1) || "dashboard");
  }

  window.HabitTracker.navigation = { initNavigation };
})();
