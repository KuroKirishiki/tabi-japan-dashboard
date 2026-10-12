/** Decorative petals with a pause control and reduced-motion support. */
export class Sakura {
  constructor() {
    this.events = new AbortController();
    this.motion = matchMedia("(prefers-reduced-motion: reduce)");
    this.enabled = true;
    try {
      this.enabled = localStorage.getItem("tabi.sakura") !== "off";
    } catch {}
    this.layer = document.createElement("div");
    this.layer.className = "sakura-layer";
    this.layer.setAttribute("aria-hidden", "true");
    const count = matchMedia("(max-width: 760px)").matches ? 16 : 28;
    for (let i = 0; i < count; i++) {
      const petal = document.createElement("span");
      petal.className = "sakura-petal";
      const size = 9 + Math.random() * 9;
      petal.style.setProperty("--petal-size", `${size}px`);
      petal.style.setProperty("--petal-left", `${Math.random() * 100}%`);
      petal.style.setProperty(
        "--petal-duration",
        `${14 + Math.random() * 14}s`,
      );
      petal.style.setProperty("--petal-delay", `${-Math.random() * 28}s`);
      petal.style.setProperty(
        "--petal-drift",
        `${(Math.random() - 0.5) * 220}px`,
      );
      petal.style.setProperty("--petal-sway", `${3 + Math.random() * 3}s`);
      this.layer.append(petal);
    }
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.className = "sakura-toggle";
    document.body.append(this.layer, this.button);
    this.button.addEventListener(
      "click",
      () => {
        this.enabled = !this.enabled;
        try {
          localStorage.setItem("tabi.sakura", this.enabled ? "on" : "off");
        } catch {}
        this.update();
      },
      { signal: this.events.signal },
    );
    this.motion.addEventListener("change", () => this.update(), {
      signal: this.events.signal,
    });
    document.addEventListener("visibilitychange", () => this.update(), {
      signal: this.events.signal,
    });
    this.update();
  }
  update() {
    const playing = this.enabled && !this.motion.matches;
    this.layer.hidden = !playing;
    this.layer.classList.toggle("paused", document.hidden);
    this.button.hidden = this.motion.matches;
    this.button.textContent = this.enabled
      ? "✿ Сакура: вкл."
      : "✿ Сакура: выкл.";
    this.button.setAttribute("aria-pressed", String(playing));
    this.button.setAttribute(
      "aria-label",
      playing ? "Остановить лепестки сакуры" : "Включить лепестки сакуры",
    );
  }
  destroy() {
    this.events.abort();
    this.layer.remove();
    this.button.remove();
  }
}
