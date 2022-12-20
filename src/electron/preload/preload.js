// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
export default window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element)
            element.innerText = text;
    };
    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});
//# sourceMappingURL=preload.js.map