import { Dashboard, widgetTypes } from "./js/Dashboard.js";
import { el } from "./js/UIComponent.js";
import { Sakura } from "./js/Sakura.js?v=sakura-layer-2";
const sakura = new Sakura();
const dashboard = new Dashboard(document.getElementById("dashboard"));
const dialog = document.getElementById("widget-dialog");
const add = document.getElementById("add-widget");
const appEvents = new AbortController();
const listen = (target, event, fn) =>
  target.addEventListener(event, fn, { signal: appEvents.signal });
for (const [type, definition] of Object.entries(widgetTypes)) {
  const button = el("button", "widget-option");
  button.type = "button";
  const text = el("span");
  text.append(
    el("strong", "", definition.title),
    el("small", "", definition.description),
  );
  button.append(el("span", "", definition.icon), text);
  listen(button, "click", () => {
    dashboard.setFilter("dashboard");
    if (location.hash !== "#dashboard") location.hash = "dashboard";
    const widget = dashboard.addWidget(type);
    dialog.close();
    if (widget) {
      widget.element.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "center",
      });
      widget.element.querySelector("button")?.focus();
    }
  });
  document.getElementById("widget-options").append(button);
}
listen(add, "click", () => dialog.showModal());
listen(document.getElementById("empty-add"), "click", () => dialog.showModal());
const pages = {
  dashboard: [
    "Дашборд",
    "Ваша Япония начинается здесь",
    "Соберите путешествие, которое захочется вспоминать.",
    "Всё для вашего путешествия",
  ],
  route: [
    "Маршрут",
    "Каждый город — новая история",
    "Токио, Киото и Осака. Четырнадцать дней, которые останутся с вами.",
    "Ваш маршрут",
  ],
  budget: [
    "Бюджет",
    "Больше впечатлений. Меньше забот",
    "Планируйте расходы и оставляйте место для спонтанных открытий.",
    "Ваш бюджет",
  ],
  places: [
    "Места и впечатления",
    "Сохраните то, что вдохновляет",
    "От шумных перекрёстков до тихих храмов — ваша коллекция Японии.",
    "Места для вашей истории",
  ],
  todo: [
    "Подготовка",
    "К путешествию — шаг за шагом",
    "Освободите голову от мелочей. Всё важное уже в вашем списке.",
    "Ваши списки подготовки",
  ],
};
function navigate() {
  const hash = location.hash.slice(1);
  const page = Object.hasOwn(pages, hash) ? hash : "dashboard";
  const [label, title, subtitle, section] = pages[page];
  document.getElementById("breadcrumb").textContent = label;
  document
    .getElementById("page-title")
    .replaceChildren(document.createTextNode(title), el("span", "", "."));
  document.getElementById("page-subtitle").textContent = subtitle;
  document.getElementById("section-title").textContent = section;
  document.querySelectorAll("nav a").forEach((a) => {
    const active = a.hash === `#${page}`;
    a.classList.toggle("active", active);
    active
      ? a.setAttribute("aria-current", "page")
      : a.removeAttribute("aria-current");
  });
  document.querySelector(".hero").hidden =
    page !== "dashboard" && page !== "route";
  document.querySelector(".stats").hidden = page !== "dashboard";
  dashboard.setFilter(page);
}
listen(window, "hashchange", navigate);
navigate();
// pagehide aborts subscriptions and API requests; persisted pages restore on return.
listen(window, "pagehide", () => {
  appEvents.abort();
  dashboard.destroy();
  sakura.destroy();
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) location.reload();
});
