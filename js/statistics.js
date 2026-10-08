(() => {
  const {
    formatDate,
    getCurrentStreak,
    getLastSevenDays,
    pluralize,
    toDateKey,
  } = window.HabitTracker.dates;
  const { createElement, createEmptyState, createMetric, setText } =
    window.HabitTracker.ui;

  function getTrackedCompletions(habits, completions, today = toDateKey()) {
    const habitById = new Map(habits.map((habit) => [habit.id, habit]));
    const seen = new Set();
    return completions.filter((mark) => {
      const habit = habitById.get(mark.habitId);
      const key = `${mark.habitId}:${mark.date}`;
      if (
        !habit ||
        !mark.completed ||
        mark.date < habit.createdAt ||
        mark.date > today ||
        seen.has(key)
      )
        return false;
      seen.add(key);
      return true;
    });
  }

  function percentage(completed, total) {
    return total ? Math.round((completed / total) * 100) : 0;
  }

  function calculateStatistics(habits, completions, today = toDateKey()) {
    const marks = getTrackedCompletions(habits, completions, today);
    const week = getLastSevenDays(today).map((date) => {
      const total = habits.filter((habit) => habit.createdAt <= date).length;
      const completed = marks.filter((mark) => mark.date === date).length;
      return { date, total, completed, percent: percentage(completed, total) };
    });
    const todayStats = week[week.length - 1];
    const weekCompleted = week.reduce((sum, day) => sum + day.completed, 0);
    const weekTotal = week.reduce((sum, day) => sum + day.total, 0);
    const bestStreak = Math.max(
      0,
      ...habits.map((habit) => getCurrentStreak(habit.id, marks, today)),
    );
    const perHabit = habits.map((habit) => {
      const total = week.filter((day) => day.date >= habit.createdAt).length;
      const completed = marks.filter(
        (mark) => mark.habitId === habit.id && mark.date >= week[0].date,
      ).length;
      return { habit, total, completed, percent: percentage(completed, total) };
    });
    return {
      today: todayStats,
      week,
      weekCompleted,
      weekTotal,
      weekPercent: percentage(weekCompleted, weekTotal),
      bestStreak,
      totalCompleted: marks.length,
      perHabit,
      completions: marks,
    };
  }

  function renderWeeklyChart(containerId, week) {
    const chart = document.getElementById(containerId);
    chart.setAttribute("role", "group");
    chart.setAttribute("aria-label", "Процент выполнения за последние 7 дней");
    const columns = week.map((day, index) => {
      const column = createElement(
        "div",
        `chart-column${index === 6 ? " chart-column--today" : ""}`,
      );
      const description = `${formatDate(day.date)}: ${day.completed} из ${day.total}, ${day.percent}%`;
      column.setAttribute("role", "img");
      column.setAttribute("aria-label", description);
      column.title = description;
      const track = createElement("div", "chart-track");
      const bar = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      bar.classList.add("chart-bar");
      bar.setAttribute("viewBox", "0 0 100 100");
      bar.setAttribute("preserveAspectRatio", "none");
      bar.setAttribute("aria-hidden", "true");
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      rect.setAttribute("x", "0");
      rect.setAttribute("y", String(100 - day.percent));
      rect.setAttribute("width", "100");
      rect.setAttribute("height", String(day.percent));
      rect.setAttribute("rx", "4");
      bar.append(rect);
      track.append(bar);
      column.append(
        createElement("span", "chart-value", `${day.percent}%`),
        track,
        createElement(
          "span",
          "chart-label",
          formatDate(day.date, { weekday: "short" }),
        ),
      );
      return column;
    });
    chart.replaceChildren(...columns);
  }

  function renderStatistics(habits, stats) {
    document
      .getElementById("statistics-summary")
      .replaceChildren(
        createMetric("Всего привычек", habits.length, "Ваши ежедневные шаги"),
        createMetric(
          "Выполнено сегодня",
          `${stats.today.completed} из ${stats.today.total}`,
          "Можно продолжить прямо сейчас",
        ),
        createMetric(
          "Прогресс сегодня",
          `${stats.today.percent}%`,
          "От привычек на сегодня",
        ),
        createMetric(
          "Лучшая текущая серия",
          pluralize(stats.bestStreak, ["день", "дня", "дней"]),
          "День за днём",
        ),
      );
    setText(
      "week-summary",
      `${pluralize(stats.weekCompleted, ["выполнение", "выполнения", "выполнений"])} из ${stats.weekTotal} возможных · ${stats.weekPercent}% за неделю`,
    );
    renderWeeklyChart("statistics-chart", stats.week);
    document
      .getElementById("habit-statistics")
      .replaceChildren(
        ...(habits.length
          ? stats.perHabit.map(createHabitStatistic)
          : [createEmptyState()]),
      );
  }

  function createHabitStatistic({ habit, total, completed, percent }) {
    const row = createElement("div", "habit-statistic");
    const name = createElement("div", "habit-statistic__name");
    name.append(
      createElement("h3", "", habit.name),
      createElement("span", "muted", `${completed} из ${total} дней`),
    );
    const progress = createElement("progress");
    progress.max = 100;
    progress.value = percent;
    progress.setAttribute("aria-label", `Прогресс за неделю: ${habit.name}`);
    row.append(name, progress, createElement("strong", "", `${percent}%`));
    return row;
  }

  window.HabitTracker.statistics = {
    getTrackedCompletions,
    calculateStatistics,
    renderWeeklyChart,
    renderStatistics,
  };
})();
