import { UIComponent, el } from "./UIComponent.js";
export class PlacesWidget extends UIComponent {
  constructor(config) {
    super({
      ...config,
      type: "places",
      title: "Места, которые вдохновляют",
      icon: "♧",
    });
    this.state.saved = Array.isArray(this.state.saved) ? this.state.saved : [];
  }
  render() {
    super.render();
    const places = [
      [
        "Фусими Инари",
        "Киото · тропа тысячи тории",
        "photo-1478436127897-769e1b3f0f36",
      ],
      [
        "Сибуя",
        "Токио · энергия мегаполиса",
        "photo-1540959733332-eab4deabeeaf",
      ],
      [
        "Дотонбори",
        "Осака · вкус вечернего города",
        "photo-1590559899731-a382839e5549",
      ],
    ];
    for (const [name, desc, image] of places) {
      const card = el("article", "place-card");
      const img = el("img");
      img.src = `https://images.unsplash.com/${image}?auto=format&fit=crop&w=120&q=75`;
      img.alt = name;
      img.loading = "lazy";
      const info = el("div");
      info.append(el("h4", "", name), el("p", "", desc));
      const save = el(
        "button",
        "icon-btn",
        this.state.saved.includes(name) ? "♥" : "♡",
      );
      save.setAttribute("aria-label", `Сохранить место: ${name}`);
      save.setAttribute(
        "aria-pressed",
        String(this.state.saved.includes(name)),
      );
      save.classList.toggle("save-active", this.state.saved.includes(name));
      this.listen(save, "click", () => {
        const saved = this.state.saved.includes(name);
        this.state.saved = saved
          ? this.state.saved.filter((x) => x !== name)
          : [...this.state.saved, name];
        save.textContent = saved ? "♡" : "♥";
        save.classList.toggle("save-active", !saved);
        save.setAttribute("aria-pressed", String(!saved));
        this.changed();
      });
      card.append(img, info, save);
      this.body.append(card);
    }
    return this.element;
  }
}
