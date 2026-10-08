(() => {
  const { getCurrentStreak, pluralize, toDateKey } = window.HabitTracker.dates;
  const { CATEGORIES, COLORS } = window.HabitTracker;
  const { createActionButton, createElement, createEmptyState, setText } =
    window.HabitTracker.ui;

  const CATEGORY_SYMBOLS = {
    Здоровье: "♡",
    Спорт: "↗",
    Саморазвитие: "▤",
    Работа: "◇",
    Отдых: "☼",
    Другое: "✳",
  };

  function isCompleted(habitId, completions, date = toDateKey()) {
    return completions.some(
      (mark) =>
        mark.habitId === habitId && mark.date === date && mark.completed,
    );
  }

  function toggleCompletion(habitId, completions, date = toDateKey()) {
    const completed = isCompleted(habitId, completions, date);
    const updated = completions.filter(
      (mark) => !(mark.habitId === habitId && mark.date === date),
    );
    if (!completed) updated.push({ habitId, date, completed: true });
    return updated;
  }

  function createHabit(values, existingHabit = null, today = toDateKey()) {
    const name = values.name.trim();
    const description = values.description.trim();
    if (!name || name.length > 80)
      throw new Error("Введите название от 1 до 80 символов.");
    if (description.length > 240)
      throw new Error("Описание должно быть не длиннее 240 символов.");
    if (
      !CATEGORIES.includes(values.category) ||
      !COLORS.includes(values.color)
    ) {
      throw new Error("Выберите категорию и цвет из списка.");
    }
    return {
      id: existingHabit?.id ?? crypto.randomUUID(),
      name,
      description,
      category: values.category,
      color: values.color,
      createdAt: existingHabit?.createdAt ?? today,
    };
  }

  function createHabitSymbol(habit) {
    const symbol = createElement(
      "span",
      `habit-symbol color-${habit.color}`,
      CATEGORY_SYMBOLS[habit.category],
    );
    symbol.setAttribute("aria-hidden", "true");
    return symbol;
  }

  function createCompletionButton(habit, completed) {
    const button = createActionButton(
      "toggle",
      completed ? "✓" : "",
      "completion-button",
      habit.id,
    );
    button.setAttribute("aria-pressed", String(completed));
    button.setAttribute(
      "aria-label",
      `${completed ? "Снять отметку" : "Выполнить"}: ${habit.name}`,
    );
    button.title = completed
      ? "Снять отметку за сегодня"
      : "Отметить выполненной сегодня";
    return button;
  }

  function createStreakLabel(habitId, completions, today) {
    const streak = getCurrentStreak(habitId, completions, today);
    const label = createElement(
      "span",
      "streak-label",
      `↗ ${pluralize(streak, ["день", "дня", "дней"])}`,
    );
    label.title = "Текущая серия последовательных дней выполнения";
    return label;
  }

  function createHabitCard(habit, completions, today) {
    const completed = isCompleted(habit.id, completions, today);
    const card = createElement(
      "article",
      `habit-card${completed ? " habit-card--completed" : ""}`,
    );
    const header = createElement("div", "habit-card__header");
    const actions = createElement("div", "habit-card__actions");
    const edit = createActionButton("edit", "✎", "icon-button", habit.id);
    edit.setAttribute("aria-label", `Редактировать: ${habit.name}`);
    const remove = createActionButton("delete", "×", "icon-button", habit.id);
    remove.setAttribute("aria-label", `Удалить: ${habit.name}`);
    actions.append(edit, remove);
    header.append(createHabitSymbol(habit), actions);
    const meta = createElement("div", "habit-card__meta");
    meta.append(
      createElement("span", "category-label", habit.category),
      createStreakLabel(habit.id, completions, today),
    );
    const status = createElement("div", "habit-card__completion");
    status.append(
      createElement(
        "span",
        "",
        completed ? "Сегодня выполнено" : "Ещё один шаг сегодня",
      ),
      createCompletionButton(habit, completed),
    );
    card.append(header, createElement("h3", "", habit.name));
    if (habit.description)
      card.append(createElement("p", "habit-description", habit.description));
    card.append(meta, status);
    return card;
  }

  function renderHabits(habits, completions, today) {
    const list = document.getElementById("habits-list");
    setText(
      "habits-count",
      habits.length
        ? pluralize(habits.length, ["привычка", "привычки", "привычек"])
        : "Пока нет привычек",
    );
    list.replaceChildren(
      ...(habits.length
        ? habits.map((habit) => createHabitCard(habit, completions, today))
        : [createEmptyState()]),
    );
  }

  function initHabitDialogs({ getHabits, saveHabit, deleteHabit }) {
    const dialog = document.getElementById("habit-dialog");
    const form = document.getElementById("habit-form");
    const deleteDialog = document.getElementById("delete-dialog");
    let editingId = null;
    let deletingId = null;

    document.addEventListener("click", (event) => {
      const close = event.target.closest("[data-close-dialog]");
      if (close) document.getElementById(close.dataset.closeDialog).close();
      const button = event.target.closest("[data-action]");
      if (!button) return;
      if (button.dataset.action === "add") openHabitForm();
      if (button.dataset.action === "edit")
        openHabitForm(
          getHabits().find((habit) => habit.id === button.dataset.habitId),
        );
      if (button.dataset.action === "delete") {
        const habit = getHabits().find(
          (item) => item.id === button.dataset.habitId,
        );
        if (!habit) return;
        deletingId = habit.id;
        setText(
          "delete-description",
          `«${habit.name}» больше не будет в вашем списке.`,
        );
        deleteDialog.showModal();
        deleteDialog.querySelector("[data-close-dialog]").focus();
      }
    });

    function openHabitForm(habit = null) {
      editingId = habit?.id ?? null;
      form.reset();
      setText("habit-form-error", "");
      setText(
        "habit-dialog-title",
        habit ? "Редактировать привычку" : "Новая привычка",
      );
      setText(
        "habit-save-button",
        habit ? "Сохранить изменения" : "Добавить привычку",
      );
      if (habit) {
        form.elements.name.value = habit.name;
        form.elements.description.value = habit.description;
        form.elements.category.value = habit.category;
        form.elements.color.value = habit.color;
      }
      dialog.showModal();
      form.elements.name.focus();
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        const values = Object.fromEntries(new FormData(form));
        const existing = editingId
          ? getHabits().find((habit) => habit.id === editingId)
          : null;
        if (editingId && !existing)
          throw new Error(
            "Привычка уже удалена. Закройте форму и обновите список.",
          );
        if (saveHabit(createHabit(values, existing))) dialog.close();
      } catch (error) {
        setText("habit-form-error", error.message);
        form.elements.name.focus();
      }
    });

    document
      .getElementById("delete-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        if (deleteHabit(deletingId)) deleteDialog.close();
      });
  }

  window.HabitTracker.habits = {
    isCompleted,
    toggleCompletion,
    createHabit,
    createHabitSymbol,
    createCompletionButton,
    createStreakLabel,
    renderHabits,
    initHabitDialogs,
  };
})();
