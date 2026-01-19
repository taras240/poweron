import { UI } from "./ui.js";
const { window: tauriWindow } = window.__TAURI__;
export const appWindow = tauriWindow.getCurrentWindow();

await appWindow.setEffects({
    effects: ['mica'],//'acrylic'
    state: 'active'
});
await appWindow.setTheme('dark');
let originalSize = null;
let isResizing = false;

// Збережіть початковий розмір
appWindow.innerSize().then(size => {
    originalSize = size;
});


appWindow.onFocusChanged(async ({ payload: focused }) => {
    if (true || (focused && !isResizing)) {
        isResizing = true;

        // Використовуємо збережений розмір
        if (originalSize) {
            await appWindow.setSize({
                type: "Physical",
                width: originalSize.width,
                height: originalSize.height
            });

            setTimeout(async () => {
                await appWindow.setSize({
                    type: "Physical",
                    width: originalSize.width,
                    height: originalSize.height
                });
                isResizing = false;
            }, 10);
        }
    }
});

appWindow.listen('tauri://resize', async () => {
    if (!isResizing) {
        originalSize = await appWindow.innerSize();
    }
});
const ui = new UI();




