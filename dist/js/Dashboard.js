import { ToDoWidget } from "./ToDoWidget.js";
import { QuoteWidget } from "./QuoteWidget.js";
import { WeatherWidget } from "./WeatherWidget.js";
import { CurrencyWidget } from "./CurrencyWidget.js";
import { RouteWidget } from "./RouteWidget.js";
import { BudgetWidget } from "./BudgetWidget.js";
import { PlacesWidget } from "./PlacesWidget.js";
export const widgetTypes = {
  weather: {
    Class: WeatherWidget,
    title: "Погода",
    description: "Текущая погода в Токио, Киото или Осаке",
    icon: "☀",
  },
  currency: {
    Class: CurrencyWidget,
    title: "Курс валют",
    description: "Перевод USD и EUR в японские иены",
    icon: "¥",
  },
  todo: {
    Class: ToDoWidget,
    title: "Список дел",
    description: "Ваш независимый список подготовки",
    icon: "☑",
  },
  quote: {
    Class: QuoteWidget,
    title: "Вдохновение",
    description: "Новая мысль для вашего путешествия",
    icon: "✿",
  },
  route: {
    Class: RouteWidget,
    title: "Маршрут",
    description: "Знакомство с тремя городами Японии",
    icon: "⌁",
  },
  budget: {
    Class: BudgetWidget,
    title: "Бюджет",
    description: "Лимит поездки и ваши расходы",
    icon: "◉",
  },
  places: {
    Class: PlacesWidget,
    title: "Места",
    description: "Сохраните любимые места",
    icon: "♧",
  },
};
const key = "tabi.dashboard.v1";
export class Dashboard {
  constructor(container) {
    this.container = container;
    this.widgets = [];
    this.filter = "dashboard";
    this.restoring = true;
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(key));
    } catch {
      saved = null;
    }
    if (!Array.isArray(saved))
      saved = [
        "weather",
        "currency",
        "quote",
        "route",
        "budget",
        "todo",
        "places",
      ].map((type) => ({ type }));
    const seen = new Set();
    for (const config of saved.slice(0, 40)) {
      if (!config || !Object.hasOwn(widgetTypes, config.type)) continue;
      const id =
        typeof config.id === "string" &&
        /^[\w-]{1,80}$/.test(config.id) &&
        !seen.has(config.id)
          ? config.id
          : crypto.randomUUID();
      seen.add(id);
      this.addWidget(config.type, {
        ...config,
        id,
        state:
          config.state &&
          typeof config.state === "object" &&
          !Array.isArray(config.state)
            ? config.state
            : {},
      });
    }
    this.restoring = false;
    this.update();
  }
  addWidget(type, config = {}) {
    const definition = Object.hasOwn(widgetTypes, type)
      ? widgetTypes[type]
      : null;
    if (!definition) return null;
    if (this.widgets.length >= 40) {
      this.announce(
        "Можно добавить до 40 виджетов. Удалите один из существующих.",
      );
      return null;
    }
    const widget = new definition.Class({
      ...config,
      onChange: () => this.update(),
      onClose: (id) => this.removeWidget(id),
      onMove: (id, direction) => this.moveWidget(id, direction),
    });
    this.widgets.push(widget);
    this.container.append(widget.render());
    if (!this.restoring) {
      this.update();
      this.announce(`Добавлен виджет: ${definition.title}`);
    }
    return widget;
  }
  removeWidget(id) {
    const index = this.widgets.findIndex((w) => w.id === id);
    if (index < 0) return;
    const [widget] = this.widgets.splice(index, 1);
    widget.destroy();
    this.update();
    this.announce(`Удалён виджет: ${widget.title}`);
    const target = this.widgets
      .slice(index)
      .concat(this.widgets.slice(0, index))
      .find((w) => !w.element.hidden);
    (
      target?.element.querySelector("button") ||
      document.getElementById("add-widget")
    ).focus();
  }
  moveWidget(id, direction) {
    const index = this.widgets.findIndex((w) => w.id === id),
      next = index + direction;
    if (index < 0 || next < 0 || next >= this.widgets.length) {
      this.announce("Виджет уже на краю панели.");
      return;
    }
    const [widget] = this.widgets.splice(index, 1);
    this.widgets.splice(next, 0, widget);
    for (const w of this.widgets) this.container.append(w.element);
    this.update();
    widget.element
      .querySelector(direction < 0 ? "button" : "button:nth-child(2)")
      ?.focus();
    this.announce(`${widget.title}: позиция ${next + 1}`);
  }
  setFilter(filter) {
    this.filter = filter;
    this.update();
  }
  update() {
    let visible = 0;
    for (const w of this.widgets) {
      w.element.hidden = this.filter !== "dashboard" && w.type !== this.filter;
      if (!w.element.hidden) visible++;
    }
    this.container.classList.toggle(
      "filter-active",
      this.filter !== "dashboard",
    );
    document.getElementById("empty-dashboard").hidden = visible > 0;
    document.getElementById("widget-count").textContent =
      `${visible} ${visible === 1 ? "виджет" : "виджетов"}`;
    const todos = this.widgets.filter((w) => w.type === "todo");
    const tasks = todos.flatMap((w) => w.tasks);
    document.getElementById("task-stat").textContent =
      `${tasks.filter((t) => t.done).length} из ${tasks.length} задач выполнено`;
    const budget = this.widgets.find((w) => w.type === "budget");
    document.querySelector(".stats>div:nth-child(2) strong").textContent =
      budget
        ? `¥ ${budget.state.total.toLocaleString("ru-RU")}`
        : "Бюджет не задан";
    if (!this.restoring) {
      try {
        localStorage.setItem(
          key,
          JSON.stringify(this.widgets.map((w) => w.serialize())),
        );
      } catch {
        document.querySelector(".local-badge").textContent =
          "Хранилище недоступно: изменения не сохраняются";
      }
    }
  }
  announce(text) {
    document.getElementById("announcement").textContent = text;
  }
  destroy() {
    this.widgets.forEach((w) => w.destroy());
    this.widgets = [];
  }
}
