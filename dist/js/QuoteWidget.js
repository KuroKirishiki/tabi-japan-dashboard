import { UIComponent, el } from "./UIComponent.js";
export class QuoteWidget extends UIComponent {
  constructor(config) {
    super({
      ...config,
      type: "quote",
      title: "Настроение путешествия",
      icon: "✿",
    });
    this.quotes = [
      "Иногда лучший маршрут — тот, с которого вы свернули.",
      "Оставьте в расписании место для неожиданного.",
      "Замедлитесь. Самые красивые детали легко пропустить.",
      "Путешествие начинается задолго до первого шага.",
    ];
    this.index = Number.isInteger(this.state.index)
      ? Math.abs(this.state.index) % this.quotes.length
      : 0;
  }
  render() {
    super.render();
    this.element.classList.add("quote");
    this.text = el("blockquote", "", this.quotes[this.index]);
    const source = el("p", "subtle", "Заметки Tabi · авторские фразы");
    const button = el("button", "refresh", "Ещё одна мысль ↻");
    this.listen(button, "click", () => {
      this.index = (this.index + 1) % this.quotes.length;
      this.text.textContent = this.quotes[this.index];
      this.changed();
    });
    this.body.append(this.text, source, button);
    return this.element;
  }
  serialize() {
    this.state.index = this.index;
    return super.serialize();
  }
}
