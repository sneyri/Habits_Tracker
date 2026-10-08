(() => {
  const { shiftDate, toDateKey } = window.HabitTracker.dates;

  // Числа показывают, сколько дней назад привычка была выполнена.
  const examples = [
    {
      id: "demo-water",
      name: "Пить воду",
      description: "Выпить несколько стаканов воды в течение дня",
      category: "Здоровье",
      color: "blue",
      daysAgo: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      id: "demo-reading",
      name: "Читать 20 минут",
      description: "Книга перед сном вместо бесконечной ленты",
      category: "Саморазвитие",
      color: "purple",
      daysAgo: [0, 1, 2, 4, 5, 6],
    },
    {
      id: "demo-walking",
      name: "Прогулка",
      description: "Выйти на свежий воздух хотя бы на 30 минут",
      category: "Здоровье",
      color: "green",
      daysAgo: [1, 2, 4, 6],
    },
    {
      id: "demo-exercise",
      name: "Утренняя зарядка",
      description: "Немного размяться после пробуждения",
      category: "Спорт",
      color: "orange",
      daysAgo: [3, 4, 5],
    },
    {
      id: "demo-evening",
      name: "Вечер без телефона",
      description: "Отложить телефон за полчаса до сна",
      category: "Отдых",
      color: "rose",
      daysAgo: [0, 3, 5, 6],
    },
  ];

  function createDemoData(habits, completions, today = toDateKey()) {
    const existingNames = new Set(
      habits.map((habit) => habit.name.trim().toLocaleLowerCase("ru-RU")),
    );
    const existingIds = new Set(habits.map((habit) => habit.id));
    const newExamples = examples.filter(
      (example) =>
        !existingIds.has(example.id) &&
        !existingNames.has(example.name.toLocaleLowerCase("ru-RU")),
    );
    const createdAt = shiftDate(today, -6);
    const newHabits = newExamples.map(({ daysAgo, ...habit }) => ({
      ...habit,
      createdAt,
    }));
    const newCompletions = newExamples.flatMap((example) =>
      example.daysAgo.map((daysAgo) => ({
        habitId: example.id,
        date: shiftDate(today, -daysAgo),
        completed: true,
      })),
    );
    return {
      habits: [...habits, ...newHabits],
      completions: [...completions, ...newCompletions],
      addedCount: newHabits.length,
    };
  }

  window.HabitTracker.demo = { createDemoData };
})();
