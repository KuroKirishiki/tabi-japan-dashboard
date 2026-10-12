import { ApiWidget } from "./ApiWidget.js";
import { el } from "./UIComponent.js";
export class CurrencyWidget extends ApiWidget {
  constructor(config) {
    super({
      ...config,
      type: "currency",
      title: "Курс японской иены",
      icon: "¥",
    });
    this.state.base = ["USD", "EUR"].includes(this.state.base)
      ? this.state.base
      : "USD";
    this.state.amount =
      Number.isFinite(this.state.amount) && this.state.amount >= 0
        ? this.state.amount
        : 100;
  }
  render() {
    super.render();
    const row = el("div", "conversion");
    this.amount = el("input", "field");
    this.amount.type = "number";
    this.amount.min = "0";
    this.amount.max = "1000000000";
    this.amount.step = "0.01";
    this.amount.value = this.state.amount;
    this.amount.setAttribute("aria-label", "Сумма для конвертации");
    this.base = el("select", "field");
    this.base.setAttribute("aria-label", "Исходная валюта");
    for (const v of ["USD", "EUR"]) {
      const o = el("option", "", v);
      o.value = v;
      this.base.append(o);
    }
    this.base.value = this.state.base;
    row.append(this.amount, this.base);
    this.body.append(row);
    this.setupStatus();
    const refresh = el("button", "refresh", "Обновить курс ↻");
    this.body.append(refresh);
    const source = el(
      "a",
      "widget-source",
      "Frankfurter · справочный курс, без комиссии",
    );
    source.href = "https://frankfurter.dev/";
    this.body.append(source);
    this.listen(refresh, "click", () => this.load());
    this.listen(this.base, "change", () => {
      this.state.base = this.base.value;
      this.changed();
      this.load();
    });
    this.listen(this.amount, "input", () => {
      const value = this.amount.valueAsNumber;
      if (!this.amount.validity.valid || !Number.isFinite(value)) {
        this.amount.setAttribute("aria-invalid", "true");
        return;
      }
      this.amount.removeAttribute("aria-invalid");
      this.state.amount = value;
      this.changed();
      this.updateResult();
    });
    this.load();
    return this.element;
  }
  load() {
    this.rate = null;
    this.request(
      `https://api.frankfurter.dev/v2/rate/${this.state.base}/JPY`,
      (data) => {
        if (
          !data ||
          !Number.isFinite(data.rate) ||
          data.rate <= 0 ||
          typeof data.date !== "string"
        )
          return false;
        this.rate = data.rate;
        this.date = data.date.slice(0, 10);
        this.updateResult();
        return true;
      },
    );
  }
  updateResult() {
    if (!this.rate) return;
    this.result.replaceChildren(
      el(
        "div",
        "rate-result",
        `¥ ${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(this.state.amount * this.rate)}`,
      ),
      el(
        "p",
        "subtle",
        `1 ${this.state.base} = ${this.rate.toFixed(2)} JPY · ${this.date}`,
      ),
    );
  }
}
