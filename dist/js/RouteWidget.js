import { UIComponent, el } from "./UIComponent.js";
export const stops = [
  {
    name: "Токио",
    days: "ДНИ 01—06",
    tag: "東京",
    desc: "Неон, уютные улочки и ритм большого города.",
    image: "photo-1540959733332-eab4deabeeaf",
  },
  {
    name: "Киото",
    days: "ДНИ 07—11",
    tag: "京都",
    desc: "Тихие сады, старые храмы и чайные церемонии.",
    image: "photo-1493976040374-85c8e12f0c0e",
  },
  {
    name: "Осака",
    days: "ДНИ 12—14",
    tag: "大阪",
    desc: "Уличная еда и вечерние прогулки у каналов.",
    image: "photo-1590559899731-a382839e5549",
  },
];
export class RouteWidget extends UIComponent {
  constructor(config) {
    super({
      ...config,
      type: "route",
      title: "Три города. Одна история.",
      icon: "⌁",
    });
  }
  render() {
    super.render();
    this.body.append(
      el(
        "p",
        "subtle",
        "Пример маршрута на 14 дней · путешествуйте в своём ритме",
      ),
    );
    const row = el("div", "route-stops");
    for (const stop of stops) {
      const card = el("article", "stop");
      const photo = el("div", "stop-photo");
      photo.style.backgroundImage = `url("https://images.unsplash.com/${stop.image}?auto=format&fit=crop&w=500&q=80")`;
      photo.setAttribute("role", "img");
      photo.setAttribute("aria-label", stop.name);
      photo.append(el("span", "", stop.days));
      card.append(
        photo,
        el("h4", "", `${stop.name} ${stop.tag}`),
        el("p", "", stop.desc),
        el("strong", "", "↓ Оставьте время для открытий"),
      );
      row.append(card);
    }
    this.body.append(row);
    return this.element;
  }
}
