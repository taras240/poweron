
const { invoke } = window.__TAURI__.core;

export const fetchUrl = async (url) => {
    url ??= "https://api.loe.lviv.ua/api/menus?page=1&type=photo-grafic";
    const responce = await invoke("fetch_site", ({ url }))
    const json = await JSON.parse(responce);
    const data = json["hydra:member"]?.[0] || json?.[0];
    console.log(json);
    const todayData = data.menuItems[0].rawHtml ?? {};
    const tomorrowData = data.menuItems[2]?.rawHtml ?? {};

    const today = parseGroups(todayData);
    const tomorrow = parseGroups(tomorrowData);
    return {
        today, tomorrow
    };
}

const toDate = (date, time = "00:00") => {
    const [d, m, y] = date.split(".");
    const [h, min] = time.split(":");

    return new Date(+y, +m - 1, +d, +h, +min);
};
const parseGroups = (data) => {
    if (!data) return {};
    const dayRegex = /(?!графік[а-яі\s]+)[\d\.]+/gi;
    const lastUpdateRegex = /(?!Інформація[а-яі\s]+)([\d\:]+\s[\d\.]+)/gi;
    const infoDate = toDate(data.match(dayRegex)?.[0]);

    const [updateTime, updateDate] = data.match(lastUpdateRegex)?.[0]?.split(" ");
    const lastUpdate = toDate(updateDate, updateTime)

    const groupStrings = data.match(/група.*/gi);

    const groupsData = groupStrings.reduce((res, s) => {
        const groupName = s.match(/(?!Група\s)\d\.\d/gi);
        const groupValue = s.match(/з[\d\:\s]+до[\d\s\:]+/gi) || s.match(/Електроенергія\sє/gi);
        const periods = [];
        for (const m of s.matchAll(/з\s*(\d{1,2}:\d{2})\s*до\s*(\d{1,2}:\d{2})/gi)) {
            periods.push({
                from: m[1],
                to: m[2]
            })
        }
        res[groupName] = periods;
        return res;
    }, {})

    return {
        day: infoDate,
        update: lastUpdate,
        data: groupsData,
    };
}   