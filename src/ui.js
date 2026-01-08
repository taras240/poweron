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
            <button id="update-data" class="update-button button">Оновити</button>
        `);
        updateButton.addEventListener("click", (event) => {
            console.log("Update");
            this.updateData();
        })
        controls.append(updateButton);
        const dataContainer = fromHtml(`
        <div id="data-container" class="data-container" ></div>
      `);
        this.app.append(controls, dataContainer);
    }
    generateDayElements(dayData) {
        const { day, update, data } = dayData;
        const elemsHtml = Object.keys(data).map(key => `
                <div class="group-item ">
                    <div class="group-name">Група ${key}</div>
                    <div class="group-values">
                        ${data[key]?.map(value => `<div>${value}</div>`).join("")}
                    </div>
                </div>
                `).join("");
        const dayElement = fromHtml(`
                <div class="day-data-container">
                    <h2 class="day-header">${day}</h2>
                    <h3>${update}</h3>
                    <div class="day-grups-container">${elemsHtml}</div>
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