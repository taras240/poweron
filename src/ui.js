import { fetchUrl } from "./fetch.js";

const fromHtml = (htmlCode) => {
    const template = document.createElement("template");
    template.innerHTML = htmlCode.trim();
    return template.content.firstElementChild;

}
export class UI {

    constructor() {
        this.app = document.getElementById("app");
        this.generateUI();
        this.updateData();
    }
    generateUI() {
        this.app.innerHTML = "";
        const controls = fromHtml(`
        <div id="data-controls" class="data-controls"></div>
      `);
        const updateButton = fromHtml(`
            <button id="update-data" class="update-button button">
            
                Оновити
            </button>
        `);
        updateButton.addEventListener("click", (event) => {
            console.log("Update");
            this.updateData();
        })
        controls.append(updateButton);
        const dataContainer = fromHtml(`
        <div id="data-container" class="data-container" ></div>
      `);
        const footer = fromHtml(`
        <footer>XarT, 2026</footer>
        `)
        this.app.append(controls, dataContainer, footer);
    }
    generateDayElements(dayData) {
        const { day, update, data } = dayData;
        const nowDay = new Date().getDate();
        const targetDay = day?.getDate();
        const isToday = targetDay === nowDay;
        const targetDateString = (date) => {
            if (!date) return "";

            const relativeDate = isToday ? "сьогодні" : "завтра";
            return `Графік відключень на ${relativeDate} (${date.toLocaleDateString()})`;
        }
        const lastUpdateString = (date) => {
            if (!date) return "";
            const isToday = date.getDate() === new Date().getDate();
            const timeString = date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });
            return `Останнє оновлення на сайті: ${isToday ? timeString : date.toLocaleString()}`
        }
        const dayHtml = (data) => {
            if (!data?.length) return "Світло є.";
            return data?.map(({ from, to }) => {
                const getMins = (time) => {
                    const [hours, mins] = time.split(":");
                    const totalMins = parseInt(mins) + parseInt(hours) * 60;
                    return totalMins;
                }
                const fromMinutes = getMins(from);
                const toMinutes = getMins(to);
                const totalMins = toMinutes - fromMinutes;
                const hours = ~~(totalMins / 60);
                const mins = totalMins - hours * 60;
                const fromPercent = 100 * fromMinutes / (60 * 24);
                const toPercent = 100 * toMinutes / (60 * 24);
                return `<div title="${hours > 0 ? `${hours}год.` : ""}${mins > 0 ? `${mins}хв.` : ""}">з ${from} до ${to}</div>`
            }).join("")
        }
        const elemsHtml = Object.keys(data || {})?.map(key => `
                <div class="group-item ">
                    <div class="group-name">Група ${key}</div>
                    <div class="group-values">
                        ${dayHtml(data[key])}
                    </div>
                </div>
                `).join("");
        const dayElement = fromHtml(`
                <div class="day-data-container">
                    <h2 class="day-header">${targetDateString(day)}</h2>
                    <h3 class="last-update-time">${lastUpdateString(update)}</h3>
                    <div class="day-grups-container">${elemsHtml || ""}</div>
                </div>
            `);
        return dayElement;
    }

    async updateData(data) {
        const dataContainer = this.app.querySelector("#data-container");
        dataContainer.innerHTML = "";
        data ??= await fetchUrl();
        const { today, tomorrow } = data;
        const todayElem = this.generateDayElements(today);
        const tomorrowElem = this.generateDayElements(tomorrow);
        dataContainer.append(todayElem, tomorrowElem);
    }
}