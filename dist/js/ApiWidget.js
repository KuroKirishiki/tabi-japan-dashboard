import { UIComponent, el } from "./UIComponent.js";
/** Aborts stale requests, owns timeout and exposes explicit API states. */
export class ApiWidget extends UIComponent {
  setupStatus() {
    this.status = el("div", "api-status");
    this.status.setAttribute("role", "status");
    this.result = el("div");
    this.body.append(this.status, this.result);
  }
  setStatus(state, message) {
    this.status.dataset.state = state;
    this.status.textContent = message;
    this.status.hidden = state === "success";
    this.result.hidden = state !== "success";
  }
  async request(url, consume) {
    this.requestController?.abort();
    clearTimeout(this.timeout);
    const controller = new AbortController();
    this.requestController = controller;
    this.setStatus("loading", "Загружаем актуальные данные…");
    let timedOut = false;
    this.timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 12000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error("HTTP");
      const data = await response.json();
      if (this.disposed || this.requestController !== controller) return;
      const present = consume(data);
      this.setStatus(
        present ? "success" : "empty",
        present ? "" : "Источник пока не вернул данные. Попробуйте обновить.",
      );
    } catch (error) {
      if (this.disposed || this.requestController !== controller) return;
      if (error.name === "AbortError" && !timedOut) return;
      this.setStatus(
        "error",
        "Не удалось загрузить данные. Проверьте соединение и нажмите «Обновить».",
      );
    } finally {
      if (this.requestController === controller) clearTimeout(this.timeout);
    }
  }
  destroy() {
    this.requestController?.abort();
    clearTimeout(this.timeout);
    super.destroy();
  }
}
