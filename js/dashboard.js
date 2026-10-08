(() => {
  const { formatDate, pluralize } = window.HabitTracker.dates;
  const {
    createCompletionButton,
    createHabitSymbol,
    createStreakLabel,
    isCompleted,
  } = window.HabitTracker.habits;
  const { renderWeeklyChart } = window.HabitTracker.statistics;
  const { createElement, createEmptyState, setText } = window.HabitTracker.ui;

  function renderDashboard(habits, stats, profile, today) {
    setText(
      "current-date",
      formatDate(today, { weekday: "long", day: "numeric", month: "long" }),
    );
    setText(
      "greeting",
      profile.name
        ? `${profile.name}, сегодня — ещё одна возможность позаботиться о себе.`
        : habits.length
          ? "Продолжайте отмечать маленькие шаги в своём темпе."
          : "Начните с одной привычки — и найдите свой ритм.",
    );
    setText("today-completed", stats.today.completed);
    setText("today-total", stats.today.total);
    setText("today-percent", `${stats.today.percent}%`);
    setText("today-count", habits.length);
    setText(
      "dashboard-streak",
      pluralize(stats.bestStreak, ["день", "дня", "дней"]),
    );
    setText("dashboard-week", stats.weekCompleted);
    const caption = !habits.length
      ? "Каждая привычка начинается с первого шага."
      : stats.today.percent === 100
        ? "Все шаги на сегодня сделаны. Отличная работа!"
        : "Маленький шаг сегодня — вклад в ваше завтра.";
    setText("progress-caption", caption);
    document.getElementById("today-progress").value = stats.today.percent;
    document
      .getElementById("progress-ring-value")
      .setAttribute("stroke-dasharray", `${stats.today.percent} 100`);
    const rows = habits.map((habit) =>
      createDashboardRow(habit, stats.completions, today),
    );
    document
      .getElementById("dashboard-habits")
      .replaceChildren(...(rows.length ? rows : [createEmptyState()]));
    renderWeeklyChart("dashboard-chart", stats.week);
  }

  function createDashboardRow(habit, completions, today) {
    const completed = isCompleted(habit.id, completions, today);
    const row = createElement(
      "article",
      `habit-row${completed ? " habit-row--completed" : ""}`,
    );
    const copy = createElement("div", "habit-copy");
    copy.append(
      createElement("h3", "", habit.name),
      createElement("span", "muted", habit.category),
    );
    row.append(
      createHabitSymbol(habit),
      copy,
      createStreakLabel(habit.id, completions, today),
      createCompletionButton(habit, completed),
    );
    return row;
  }

  window.HabitTracker.dashboard = { renderDashboard };
})();
