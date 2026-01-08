
const { invoke } = window.__TAURI__.core;

export const fetchUrl = async (url) => {
    url ??= "https://api.loe.lviv.ua/api/menus?page=1&type=photo-grafic";
    const resolve = await invoke("fetch_site", ({ url }))
    const json = await JSON.parse(resolve);
    console.log(json)
    const todayData = json["hydra:member"][0].menuItems[0].rawHtml;
    const tomorrowData = json["hydra:member"][0].menuItems[2]?.rawHtml ?? {};
    //     const data = `
    //     <div><p><b>Графік погодинних відключень на 08.01.2026</b></p>
    // <p><b>Інформація станом на 16:16 08.01.2026</b></p>
    // <p>Група 1.1. Електроенергії немає з 15:30 до 17:00.</p>
    // <p>Група 1.2. Електроенергії немає з 20:30 до 24:00.</p>
    // <p>Група 2.1. Електроенергії немає з 13:30 до 17:00.</p>
    // <p>Група 2.2. Електроенергії немає з 13:30 до 16:30.</p>
    // <p>Група 3.1. Електроенергії немає з 13:30 до 17:00.</p>
    // <p>Група 3.2. Електроенергії немає з 10:30 до 13:30.</p>
    // <p>Група 4.1. Електроенергії немає з 17:00 до 20:30.</p>
    // <p>Група 4.2. Електроенергії немає з 17:00 до 20:00.</p>
    // <p>Група 5.1. Електроенергії немає з 10:30 до 13:30.</p>
    // <p>Група 5.2. Електроенергії немає з 17:00 до 20:00.</p>
    // <p>Група 6.1. Електроенергії немає з 12:00 до 13:30.</p>
    // <p>Група 6.2. Електроенергія є.</p>
    // </div> `;
    const today = parseGroups(todayData);
    const tomorrow = parseGroups(tomorrowData);
    return {
        today, tomorrow
    };
}
const parseGroups = (data) => {
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

    // const groupsData = groupsArray.reduce((res, grString) => {
    //     const groupRegex = /(?:Група\s)[\d\.]+/gis;
    //     const dataRegex = /(з[\d\.\:\s]+до[\d\.\:\s]+)/gi;
    //     const group = grString.match(groupRegex);

    //     const groupData = grString.match(dataRegex);
    //     res[group] = groupData || [grString.replace(groupRegex, "")];

    //     return res;
    // }, {});
    // console.log(groupsData);
    return {
        day: infoDate,
        update: updateDate,
        data: groupsData,
    };
}   