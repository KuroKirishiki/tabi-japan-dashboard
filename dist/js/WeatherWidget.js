import { ApiWidget } from "./ApiWidget.js";
import { el } from "./UIComponent.js";
const cities = {
  tokyo: { name: "Токио", lat: 35.68, lon: 139.69 },
  kyoto: { name: "Киото", lat: 35.01, lon: 135.77 },
  osaka: { name: "Осака", lat: 34.69, lon: 135.5 },
};
export class WeatherWidget extends ApiWidget {
  constructor(config) {
    super({ ...config, type: "weather", title: "Погода в Японии", icon: "☀" });
    this.state.city = cities[this.state.city] ? this.state.city : "tokyo";
  }
  render() {
    super.render();
    const row = el("div", "city-line");
    this.select = el("select", "field");
    this.select.setAttribute("aria-label", "Город для погоды");
    for (const [id, c] of Object.entries(cities)) {
      const o = el("option", "", c.name);
      o.value = id;
      this.select.append(o);
    }
    this.select.value = this.state.city;
    const refresh = el("button", "refresh", "Обновить ↻");
    row.append(this.select, refresh);
    this.body.append(row);
    this.setupStatus();
    this.body.append(el("a", "widget-source", "Open-Meteo · текущая погода"));
    this.body.lastChild.href = "https://open-meteo.com/";
    this.listen(this.select, "change", () => {
      this.state.city = this.select.value;
      this.changed();
      this.load();
    });
    this.listen(refresh, "click", () => this.load());
    this.load();
    return this.element;
  }
  load() {
    const c = cities[this.state.city];
    this.request(
      `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=Asia%2FTokyo`,
      (data) => {
        const v = data?.current;
        if (
          !v ||
          !Number.isFinite(v.temperature_2m) ||
          !Number.isFinite(v.weather_code)
        )
          return false;
        this.result.replaceChildren();
        const num = el("div", "api-number", `${Math.round(v.temperature_2m)}°`);
        num.append(el("small", "", " C"));
        const code = v.weather_code;
        const condition =
          code === 0
            ? "Ясно"
            : code <= 3
              ? "Переменная облачность"
              : code <= 48
                ? "Туман"
                : code <= 67
                  ? "Дождь"
                  : code <= 77
                    ? "Снег"
                    : code <= 82
                      ? "Ливни"
                      : code <= 86
                        ? "Снегопад"
                        : "Гроза";
        this.result.append(
          num,
          el("div", "subtle", `${condition} · ${c.name}`),
        );
        const extra = el("div", "weather-extra");
        for (const [label, value] of [
          [
            "Ветер",
            Number.isFinite(v.wind_speed_10m)
              ? `${v.wind_speed_10m} км/ч`
              : "—",
          ],
          [
            "Влажность",
            Number.isFinite(v.relative_humidity_2m)
              ? `${v.relative_humidity_2m}%`
              : "—",
          ],
        ]) {
          const item = el("div", "", label);
          item.append(el("strong", "", value));
          extra.append(item);
        }
        this.result.append(extra);
        return true;
      },
    );
  }
}
