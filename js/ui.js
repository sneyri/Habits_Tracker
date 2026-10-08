(() => {
  function createElement(tag, className = "", text = "") {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
  }

  function setText(id, value) {
    document.getElementById(id).textContent = value;
  }

  function createActionButton(action, label, className, habitId = "") {
    const button = createElement("button", className, label);
    button.type = "button";
    button.dataset.action = action;
    if (habitId) button.dataset.habitId = habitId;
    return button;
  }

  function createEmptyState() {
    const empty = createElement("div", "empty-state");
    const icon = createElement("span", "empty-state__icon", "✳");
    icon.setAttribute("aria-hidden", "true");
    empty.append(
      icon,
      createElement("h3", "", "Найдите свой первый ритм"),
      createElement(
        "p",
        "",
        "Добавьте привычку, которую хотите сделать частью своей жизни. Начните с малого.",
      ),
      createActionButton(
        "add",
        "＋ Добавить привычку",
        "button button--primary",
      ),
    );
    return empty;
  }

  function createMetric(label, value, caption) {
    const card = createElement("article", "metric-card");
    card.append(
      createElement("p", "", label),
      createElement("strong", "", value),
      createElement("span", "muted", caption),
    );
    return card;
  }

  let notificationTimer;

  function notify(message) {
    const notification = document.getElementById("notification");
    clearTimeout(notificationTimer);
    notification.textContent = message;
    notification.hidden = false;
    notificationTimer = setTimeout(() => {
      notification.hidden = true;
    }, 3500);
  }

  function showStorageError(message) {
    const banner = document.getElementById("storage-error");
    banner.textContent = message;
    banner.hidden = false;
  }

  function clearStorageError() {
    document.getElementById("storage-error").hidden = true;
  }

  window.HabitTracker.ui = {
    createElement,
    setText,
    createActionButton,
    createEmptyState,
    createMetric,
    notify,
    showStorageError,
    clearStorageError,
  };
})();
