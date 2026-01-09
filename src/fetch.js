
const { invoke } = window.__TAURI__.core;

export const fetchUrl = async (url) => {
    url ??= "https://api.loe.lviv.ua/api/menus?page=1&type=photo-grafic";
    const responce = await invoke("fetch_site", ({ url }))
    const json = await JSON.parse(responce);
    const data = json["hydra:member"]?.[0] || json?.[0];
    console.log(data)
    const todayData = data.menuItems[0].rawHtml ?? {};
    const tomorrowData = data.menuItems[2]?.rawHtml ?? {};

    const today = parseGroups(todayData);
    const tomorrow = parseGroups(tomorrowData);
    return {
        today, tomorrow
    };
}
const parseGroups = (data) => {
    if (!data) return {};
    const dayRegex = /графік[а-яі\s\d\.]+/gi;
    const lastUpdateRegex = /Інформація[а-яі\s\d\.\:]+/gi;
    const infoDate = data.match(dayRegex)?.[0];
    const updateDate = data.match(lastUpdateRegex)?.[0];

    const groupStrings = data.match(/група.*/gi);

    const groupsData = groupStrings.reduce((res, s) => {
        const groupName = s.match(/(?!Група\s)\d\.\d/gi);
        const groupValue = s.match(/з[\d\:\s]+до[\d\s\:]+/gi) || s.match(/Електроенергія\sє/gi);
        res[groupName] = groupValue;
        return res;
    }, {})

    return {
        day: infoDate,
        update: updateDate,
        data: groupsData,
    };
}   