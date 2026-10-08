(() => {
  const { toDateKey } = window.HabitTracker.dates;
  const { storage, STORAGE_KEYS } = window.HabitTracker;
  const { createDemoData } = window.HabitTracker.demo;
  const { initNavigation } = window.HabitTracker.navigation;
  const { initHabitDialogs, renderHabits, toggleCompletion } =
    window.HabitTracker.habits;
  const { renderDashboard } = window.HabitTracker.dashboard;
  const { calculateStatistics, renderStatistics } =
    window.HabitTracker.statistics;
  const { initProfileForm, renderProfile } = window.HabitTracker.profile;
  const { clearStorageError, notify, showStorageError } =
    window.HabitTracker.ui;

  function initApp() {
    initNavigation();
    let habits = [];
    let completions = [];
    let profile;
    let today = toDateKey();
    let ready = false;

    function render() {
      today = toDateKey();
      const stats = calculateStatistics(habits, completions, today);
      renderDashboard(habits, stats, profile, today);
      renderHabits(habits, stats.completions, today);
      renderStatistics(habits, stats);
      renderProfile(profile, habits, stats);
    }

    function loadData() {
      try {
        let savedHabits = storage.getHabits();
        let savedCompletions = storage.getCompletions();
        const existingProfile = storage.getProfile();
        let addedDemoCount = 0;
        let savedProfile = existingProfile ?? {
          name: "",
          startedAt: toDateKey(),
        };
        if (!savedProfile.demoSeeded) {
          const demo = createDemoData(savedHabits, savedCompletions);
          if (demo.addedCount > 0) {
            storage.saveHabitsAndCompletions(demo.habits, demo.completions);
            savedHabits = demo.habits;
            savedCompletions = demo.completions;
            addedDemoCount = demo.addedCount;
          }
          savedProfile = { ...savedProfile, demoSeeded: true };
          storage.saveProfile(savedProfile);
        }
        habits = savedHabits;
        completions = savedCompletions;
        profile = savedProfile;
        ready = true;
        clearStorageError();
        render();
        if (addedDemoCount > 0) {
          notify(
            `Добавлено ${addedDemoCount} примеров привычек для знакомства с трекером.`,
          );
        }
      } catch {
        ready = false;
        showStorageError(
          "Не удалось прочитать или сохранить данные. Разрешите локальное хранилище и перезагрузите страницу. Если сохранённые данные повреждены, они не будут перезаписаны.",
        );
      }
    }

    function persist(action, message) {
      if (!ready) {
        notify("Сначала восстановите доступ к сохранённым данным.");
        return false;
      }
      try {
        action();
        clearStorageError();
        render();
        notify(message);
        return true;
      } catch {
        showStorageError(
          "Не удалось сохранить изменения. Проверьте доступ к localStorage и свободное место в браузере, затем повторите действие.",
        );
        notify("Изменения не сохранены.");
        return false;
      }
    }

    initHabitDialogs({
      getHabits: () => habits,
      saveHabit(habit) {
        const exists = habits.some((item) => item.id === habit.id);
        const updated = exists
          ? habits.map((item) => (item.id === habit.id ? habit : item))
          : [...habits, habit];
        return persist(
          () => {
            storage.saveHabits(updated);
            habits = updated;
          },
          exists
            ? "Привычка обновлена."
            : "Привычка добавлена. Первый шаг сделан!",
        );
      },
      deleteHabit(id) {
        const updatedHabits = habits.filter((habit) => habit.id !== id);
        const updatedCompletions = completions.filter(
          (mark) => mark.habitId !== id,
        );
        return persist(() => {
          storage.saveHabitsAndCompletions(updatedHabits, updatedCompletions);
          habits = updatedHabits;
          completions = updatedCompletions;
        }, "Привычка и её отметки удалены.");
      },
    });

    document.addEventListener("click", (event) => {
      const button = event.target.closest('[data-action="toggle"]');
      if (
        !button ||
        !habits.some((habit) => habit.id === button.dataset.habitId)
      )
        return;
      const updated = toggleCompletion(
        button.dataset.habitId,
        completions,
        toDateKey(),
      );
      const label =
        button.getAttribute("aria-pressed") === "true"
          ? "Отметка снята."
          : "Отлично! Ещё один шаг сделан.";
      const sectionId = button.closest(".section").id;
      if (
        persist(() => {
          storage.saveCompletions(updated);
          completions = updated;
        }, label)
      ) {
        // Карточки пересоздаются; возвращаем фокус на тот же переключатель для клавиатуры.
        const replacement = [
          ...document
            .getElementById(sectionId)
            .querySelectorAll('[data-action="toggle"]'),
        ].find((item) => item.dataset.habitId === button.dataset.habitId);
        replacement?.focus({ preventScroll: true });
      }
    });

    initProfileForm((name) =>
      persist(() => {
        const updated = { ...profile, name };
        storage.saveProfile(updated);
        profile = updated;
      }, "Имя сохранено."),
    );

    window.addEventListener("storage", (event) => {
      if (event.key === null || Object.values(STORAGE_KEYS).includes(event.key))
        loadData();
    });
    function refreshDay() {
      if (ready && today !== toDateKey()) render();
    }
    window.addEventListener("focus", refreshDay);
    document.addEventListener("visibilitychange", refreshDay);
    setInterval(refreshDay, 30000);
    loadData();
  }

  initApp();
})();
