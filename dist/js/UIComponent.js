/** Base widget. Owns its DOM, event subscriptions and lifecycle. */
export class UIComponent {
  constructor({
    id = crypto.randomUUID(),
    title,
    icon = "◫",
    type,
    state = {},
    onChange = () => {},
    onClose = () => {},
    onMove = () => {},
  }) {
    if (new.target === UIComponent)
      throw new TypeError("UIComponent is abstract");
    Object.assign(this, {
      id,
      title,
      icon,
      type,
      state,
      onChange,
      onClose,
      onMove,
    });
    this.events = new AbortController();
    this.disposed = false;
    this.minimized = Boolean(state.minimized);
  }
  render() {
    this.element = document.createElement("section");
    this.element.className = "widget";
    this.element.dataset.type = this.type;
    this.element.setAttribute("aria-label", this.title);
    this.element.dataset.id = this.id;
    const header = document.createElement("header");
    header.className = "widget-header";
    const title = document.createElement("h3");
    const icon = document.createElement("span");
    icon.className = "widget-icon";
    icon.textContent = this.icon;
    title.append(icon, document.createTextNode(this.title));
    header.append(title);
    const tools = document.createElement("div");
    tools.className = "widget-tools";
    for (const [text, label, action] of [
      ["↑", "Переместить выше", () => this.onMove(this.id, -1)],
      ["↓", "Переместить ниже", () => this.onMove(this.id, 1)],
      ["−", "Свернуть виджет", () => this.minimize()],
      ["×", "Удалить виджет", () => this.close()],
    ]) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "icon-btn";
      b.textContent = text;
      b.title = label;
      b.setAttribute("aria-label", `${label}: ${this.title}`);
      this.listen(b, "click", action);
      tools.append(b);
      if (text === "−") {
        this.minimizeButton = b;
        b.setAttribute("aria-expanded", String(!this.minimized));
        b.textContent = this.minimized ? "+" : "−";
        b.setAttribute(
          "aria-label",
          `${this.minimized ? "Развернуть" : "Свернуть"} виджет: ${this.title}`,
        );
      }
    }
    header.append(tools);
    this.body = document.createElement("div");
    this.body.className = "widget-body";
    this.element.append(header, this.body);
    this.element.classList.toggle("minimized", this.minimized);
    return this.element;
  }
  listen(target, event, handler) {
    target.addEventListener(event, handler, { signal: this.events.signal });
  }
  minimize() {
    this.minimized = !this.minimized;
    this.element.classList.toggle("minimized", this.minimized);
    this.minimizeButton.setAttribute("aria-expanded", String(!this.minimized));
    this.minimizeButton.textContent = this.minimized ? "+" : "−";
    this.minimizeButton.setAttribute(
      "aria-label",
      `${this.minimized ? "Развернуть" : "Свернуть"} виджет: ${this.title}`,
    );
    this.changed();
  }
  close() {
    this.onClose(this.id);
  }
  changed() {
    this.onChange();
  }
  serialize() {
    return {
      type: this.type,
      id: this.id,
      state: { ...this.state, minimized: this.minimized },
    };
  }
  destroy() {
    this.disposed = true;
    this.events.abort();
    this.element?.remove();
  }
}
export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
