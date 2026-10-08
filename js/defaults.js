(() => {
  const { toDateKey } = window.HabitTracker.dates;

  const initialHabits = [
    {
      id: "default-water",
      name: "Пить воду",
      description: "Выпить несколько стаканов воды в течение дня",
      category: "Здоровье",
      color: "blue",
    },
    {
      id: "default-reading",
      name: "Читать 20 минут",
      description: "Выделить немного времени для книги",
      category: "Саморазвитие",
      color: "purple",
    },
    {
      id: "default-walking",
      name: "Прогулка",
      description: "Выйти на свежий воздух хотя бы на 30 минут",
      category: "Здоровье",
      color: "green",
    },
    {
      id: "default-exercise",
      name: "Утренняя зарядка",
      description: "Немного размяться после пробуждения",
      category: "Спорт",
      color: "orange",
    },
    {
      id: "default-evening",
      name: "Вечер без телефона",
      description: "Отложить телефон за полчаса до сна",
      category: "Отдых",
      color: "rose",
    },
  ];

  const legacyDemoIds = new Set([
    "demo-water",
    "demo-reading",
    "demo-walking",
    "demo-exercise",
    "demo-evening",
  ]);

  function prepareInitialData(habits, completions, today = toDateKey()) {
    // Удаляем историю прежних тестовых примеров при переходе на базовые привычки.
    const personalHabits = habits.filter(
      (habit) => !legacyDemoIds.has(habit.id),
    );
    const personalCompletions = completions.filter(
      (mark) => !legacyDemoIds.has(mark.habitId),
    );
    const existingNames = new Set(
      personalHabits.map((habit) =>
        habit.name.trim().toLocaleLowerCase("ru-RU"),
      ),
    );
    const existingIds = new Set(personalHabits.map((habit) => habit.id));
    const newHabits = initialHabits
      .filter(
        (habit) =>
          !existingIds.has(habit.id) &&
          !existingNames.has(habit.name.toLocaleLowerCase("ru-RU")),
      )
      .map((habit) => ({ ...habit, createdAt: today }));
    return {
      habits: [...personalHabits, ...newHabits],
      completions: personalCompletions,
    };
  }

  window.HabitTracker.defaults = { prepareInitialData };
})();
