import { UIComponent, el } from "./UIComponent.js";
export class BudgetWidget extends UIComponent {
  constructor(config) {
    super({
      ...config,
      type: "budget",
      title: "Бюджет путешествия",
      icon: "◉",
    });
    this.state.total =
      Number.isFinite(this.state.total) && this.state.total > 0
        ? this.state.total
        : 240000;
    this.state.expenses = Array.isArray(this.state.expenses)
      ? this.state.expenses.filter(
          (x) =>
            x &&
            typeof x.name === "string" &&
            Number.isFinite(x.amount) &&
            x.amount >= 0,
        )
      : [
          { name: "Жильё", amount: 72000 },
          { name: "Транспорт", amount: 38000 },
          { name: "Еда и впечатления", amount: 34000 },
        ];
  }
  render() {
    super.render();
    this.summary = el("div", "budget-summary");
    this.bars = el("div", "budget-bars");
    const limitLabel = el("label", "subtle", "Лимит бюджета, JPY");
    this.limit = el("input", "field");
    this.limit.type = "number";
    this.limit.min = "1";
    this.limit.max = "1000000000";
    this.limit.value = this.state.total;
    limitLabel.append(this.limit);
    this.form = el("form", "budget-controls");
    this.name = el("input", "field");
    this.name.placeholder = "Расход";
    this.name.required = true;
    this.name.maxLength = 80;
    this.name.setAttribute("aria-label", "Название расхода");
    this.amount = el("input", "field");
    this.amount.type = "number";
    this.amount.min = "1";
    this.amount.max = "1000000000";
    this.amount.placeholder = "¥";
    this.amount.required = true;
    this.amount.setAttribute("aria-label", "Сумма расхода в иенах");
    const add = el("button", "refresh", "＋");
    add.type = "submit";
    add.setAttribute("aria-label", "Добавить расход");
    this.form.append(this.name, this.amount, add);
    this.body.append(this.summary, this.bars, limitLabel, this.form);
    this.listen(this.limit, "change", () => {
      if (!this.limit.validity.valid) return;
      this.state.total = this.limit.valueAsNumber;
      this.paint();
      this.changed();
    });
    this.listen(this.form, "submit", (e) => {
      e.preventDefault();
      if (!this.form.reportValidity() || !this.name.value.trim()) return;
      this.state.expenses.push({
        name: this.name.value.trim(),
        amount: this.amount.valueAsNumber,
      });
      this.form.reset();
      this.paint();
      this.changed();
    });
    this.listen(this.bars, "click", (e) => {
      const b = e.target.closest("button[data-index]");
      if (!b) return;
      const index = Number(b.dataset.index);
      this.state.expenses.splice(index, 1);
      this.paint();
      this.changed();
      (this.bars.querySelector("button") || this.name).focus();
    });
    this.paint();
    return this.element;
  }
  paint() {
    const used = this.state.expenses.reduce((sum, x) => sum + x.amount, 0);
    const percent = Math.round((used / this.state.total) * 100);
    this.summary.replaceChildren();
    const ring = el("div", "budget-ring");
    ring.style.background = `conic-gradient(${used > this.state.total ? "#b9493c" : "#244a3c"} ${Math.min(percent, 100) * 3.6}deg,#edf0e6 0deg)`;
    ring.append(el("span", "", `${percent}%`));
    const info = el("div");
    info.append(
      el(
        "div",
        "subtle",
        used > this.state.total ? "Лимит превышен" : "Запланировано",
      ),
      el("div", "budget-total", `¥ ${used.toLocaleString("ru-RU")}`),
      el("div", "subtle", `из ¥ ${this.state.total.toLocaleString("ru-RU")}`),
    );
    this.summary.append(ring, info);
    this.bars.replaceChildren();
    for (const [index, x] of this.state.expenses.entries()) {
      const wrap = el("div");
      const row = el("div", "budget-row");
      const del = el("button", "icon-btn", "×");
      del.dataset.index = index;
      del.setAttribute("aria-label", `Удалить расход: ${x.name}`);
      row.append(
        el("span", "", x.name),
        el("span", "", `¥ ${x.amount.toLocaleString("ru-RU")}`),
        del,
      );
      const bar = el("div", "budget-bar");
      const fill = el("span");
      fill.style.width = `${Math.min((x.amount / this.state.total) * 100, 100)}%`;
      bar.append(fill);
      wrap.append(row, bar);
      this.bars.append(wrap);
    }
    this.body
      .querySelector(".budget-total")
      ?.setAttribute("aria-live", "polite");
  }
}
