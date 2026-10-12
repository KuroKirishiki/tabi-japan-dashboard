import { UIComponent, el } from "./UIComponent.js";
export class ToDoWidget extends UIComponent {
  constructor(config) {
    super({
      ...config,
      type: "todo",
      title: "Готовимся к путешествию",
      icon: "☑",
    });
    this.tasks = Array.isArray(this.state.tasks)
      ? this.state.tasks
          .filter(
            (t) => t && typeof t.id === "string" && typeof t.text === "string",
          )
          .map((t) => ({ ...t, done: Boolean(t.done) }))
      : [
          {
            id: crypto.randomUUID(),
            text: "Составить маршрут по городам",
            done: true,
          },
          {
            id: crypto.randomUUID(),
            text: "Выбрать жильё в Токио",
            done: false,
          },
          {
            id: crypto.randomUUID(),
            text: "Собрать документы для поездки",
            done: false,
          },
        ];
  }
  render() {
    super.render();
    this.progress = el("div", "task-progress");
    this.track = el("div", "progress-track");
    this.fill = el("span");
    this.track.append(this.fill);
    this.form = el("form", "todo-form");
    this.input = el("input", "field");
    this.input.placeholder = "Что ещё нужно сделать?";
    this.input.maxLength = 200;
    this.input.required = true;
    this.input.setAttribute("aria-label", "Новая задача");
    const add = el("button", "", "+");
    add.type = "submit";
    add.setAttribute("aria-label", "Добавить задачу");
    this.form.append(this.input, add);
    this.list = el("ul", "tasks");
    this.body.append(this.progress, this.track, this.form, this.list);
    this.listen(this.form, "submit", (event) => {
      event.preventDefault();
      this.addTask(this.input.value);
      this.input.value = "";
      this.input.focus();
    });
    this.listen(this.list, "change", (event) => {
      const input = event.target.closest("input[data-task]");
      if (input) this.toggleTask(input.dataset.task, input.checked);
    });
    this.listen(this.list, "click", (event) => {
      const button = event.target.closest("button[data-delete]");
      if (button) this.removeTask(button.dataset.delete);
    });
    this.paint();
    return this.element;
  }
  addTask(text) {
    text = text.trim().slice(0, 200);
    if (!text) return;
    this.tasks.push({ id: crypto.randomUUID(), text, done: false });
    this.paint();
    this.changed();
  }
  toggleTask(id, done) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) task.done = done;
    this.paint();
    this.changed();
    this.list.querySelector(`input[data-task="${id}"]`)?.focus();
  }
  removeTask(id) {
    const index = this.tasks.findIndex((t) => t.id === id);
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.paint();
    this.changed();
    const items = this.list.querySelectorAll("button");
    (items[Math.min(index, items.length - 1)] || this.input).focus();
  }
  paint() {
    this.list.replaceChildren();
    for (const task of this.tasks) {
      const item = el("li", task.done ? "done" : "");
      const label = el("label");
      const checkbox = el("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.dataset.task = task.id;
      label.append(checkbox, el("span", "", task.text));
      const del = el("button", "icon-btn", "×");
      del.type = "button";
      del.dataset.delete = task.id;
      del.setAttribute("aria-label", `Удалить задачу: ${task.text}`);
      item.append(label, del);
      this.list.append(item);
    }
    const completed = this.tasks.filter((t) => t.done).length;
    this.progress.replaceChildren(
      el("span", "", `${completed} из ${this.tasks.length} выполнено`),
      el(
        "span",
        "",
        `${this.tasks.length ? Math.round((completed / this.tasks.length) * 100) : 0}%`,
      ),
    );
    this.fill.style.width = `${this.tasks.length ? (completed / this.tasks.length) * 100 : 0}%`;
    if (!this.tasks.length)
      this.list.append(
        el("li", "subtle", "Добавьте первую задачу — и вы на шаг ближе."),
      );
  }
  serialize() {
    this.state.tasks = this.tasks;
    return super.serialize();
  }
}
