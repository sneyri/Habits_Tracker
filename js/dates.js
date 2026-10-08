(() => {
  function toDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function fromDateKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    // Полдень и календарный setDate безопаснее вычитания 24 часов при смене часового пояса.
    return new Date(year, month - 1, day, 12);
  }

  function isDateKey(value) {
    return (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      toDateKey(fromDateKey(value)) === value
    );
  }

  function shiftDate(key, days) {
    const date = fromDateKey(key);
    date.setDate(date.getDate() + days);
    return toDateKey(date);
  }

  function getLastSevenDays(today = toDateKey()) {
    return Array.from({ length: 7 }, (_, index) => shiftDate(today, index - 6));
  }

  function formatDate(
    key,
    options = { day: "numeric", month: "long", year: "numeric" },
  ) {
    return new Intl.DateTimeFormat("ru-RU", options).format(fromDateKey(key));
  }

  function pluralize(count, forms) {
    const lastTwo = Math.abs(count) % 100;
    const last = lastTwo % 10;
    const form =
      lastTwo >= 11 && lastTwo <= 14
        ? 2
        : last === 1
          ? 0
          : last >= 2 && last <= 4
            ? 1
            : 2;
    return `${count} ${forms[form]}`;
  }

  function getCurrentStreak(habitId, completions, today = toDateKey()) {
    const completedDays = new Set(
      completions
        .filter(
          (mark) =>
            mark.habitId === habitId && mark.completed && mark.date <= today,
        )
        .map((mark) => mark.date),
    );
    let day = completedDays.has(today) ? today : shiftDate(today, -1);
    let streak = 0;
    // Пока сегодня не закончился, серия может продолжаться со вчерашнего дня.
    while (completedDays.has(day)) {
      streak += 1;
      day = shiftDate(day, -1);
    }
    return streak;
  }

  window.HabitTracker = window.HabitTracker || {};
  window.HabitTracker.dates = {
    toDateKey,
    fromDateKey,
    isDateKey,
    shiftDate,
    getLastSevenDays,
    formatDate,
    pluralize,
    getCurrentStreak,
  };
})();
