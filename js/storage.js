(() => {
  const { isDateKey } = window.HabitTracker.dates;

  const STORAGE_KEYS = {
    habits: "habits_tracker.habits",
    completions: "habits_tracker.completions",
    profile: "habits_tracker.profile",
  };

  const CATEGORIES = [
    "Здоровье",
    "Спорт",
    "Саморазвитие",
    "Работа",
    "Отдых",
    "Другое",
  ];
  const COLORS = ["green", "blue", "purple", "orange", "rose"];

  function read(key, fallback) {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function isHabit(habit) {
    return (
      habit &&
      typeof habit.id === "string" &&
      habit.id.length > 0 &&
      typeof habit.name === "string" &&
      habit.name.trim().length > 0 &&
      habit.name.length <= 80 &&
      typeof habit.description === "string" &&
      habit.description.length <= 240 &&
      CATEGORIES.includes(habit.category) &&
      COLORS.includes(habit.color) &&
      isDateKey(habit.createdAt)
    );
  }

  function isCompletion(mark) {
    return (
      mark &&
      typeof mark.habitId === "string" &&
      isDateKey(mark.date) &&
      typeof mark.completed === "boolean"
    );
  }

  const storage = {
    getHabits() {
      const habits = read(STORAGE_KEYS.habits, []);
      if (
        !Array.isArray(habits) ||
        !habits.every(isHabit) ||
        new Set(habits.map((habit) => habit.id)).size !== habits.length
      ) {
        throw new Error("Некорректные данные привычек");
      }
      return habits;
    },
    saveHabits(habits) {
      write(STORAGE_KEYS.habits, habits);
    },
    getCompletions() {
      const marks = read(STORAGE_KEYS.completions, []);
      if (!Array.isArray(marks) || !marks.every(isCompletion)) {
        throw new Error("Некорректные отметки выполнения");
      }
      return marks;
    },
    saveCompletions(completions) {
      write(STORAGE_KEYS.completions, completions);
    },
    getProfile() {
      const profile = read(STORAGE_KEYS.profile, null);
      if (
        profile !== null &&
        (!profile ||
          typeof profile.name !== "string" ||
          profile.name.length > 40 ||
          !isDateKey(profile.startedAt))
      ) {
        throw new Error("Некорректные данные профиля");
      }
      return profile;
    },
    saveProfile(profile) {
      write(STORAGE_KEYS.profile, profile);
    },
    saveHabitsAndCompletions(habits, completions) {
      const previousHabits = localStorage.getItem(STORAGE_KEYS.habits);
      const previousCompletions = localStorage.getItem(
        STORAGE_KEYS.completions,
      );
      try {
        this.saveCompletions(completions);
        this.saveHabits(habits);
      } catch (error) {
        // Если вторая запись не удалась, возвращаем обе коллекции в прежнее состояние.
        restore(STORAGE_KEYS.habits, previousHabits);
        restore(STORAGE_KEYS.completions, previousCompletions);
        throw error;
      }
    },
  };

  function restore(key, value) {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }

  window.HabitTracker.storage = storage;
  window.HabitTracker.STORAGE_KEYS = STORAGE_KEYS;
  window.HabitTracker.CATEGORIES = CATEGORIES;
  window.HabitTracker.COLORS = COLORS;
})();
