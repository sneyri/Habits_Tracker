(() => {
  const { formatDate } = window.HabitTracker.dates;
  const { createMetric, setText } = window.HabitTracker.ui;

  function renderProfile(profile, habits, stats) {
    setText("profile-display-name", profile.name || "Ваш профиль");
    setText(
      "profile-avatar",
      profile.name
        ? Array.from(profile.name)[0].toLocaleUpperCase("ru-RU")
        : "Р",
    );
    setText(
      "profile-since",
      `В своём ритме с ${formatDate(profile.startedAt)}`,
    );
    document
      .getElementById("profile-summary")
      .replaceChildren(
        createMetric("Всего привычек", habits.length, "То, что важно вам"),
        createMetric(
          "Всего выполнений",
          stats.totalCompleted,
          "Каждый шаг считается",
        ),
      );
    const input = document.getElementById("profile-name");
    if (document.activeElement !== input) input.value = profile.name;
  }

  function initProfileForm(saveProfile) {
    document
      .getElementById("profile-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        const name = document.getElementById("profile-name").value.trim();
        saveProfile(name);
      });
  }

  window.HabitTracker.profile = { renderProfile, initProfileForm };
})();
