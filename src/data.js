export let dir;

export let projects;
export let architects;

export async function init() {
    dir = await window.electron.getAppDataPath();
    console.log(dir);
    projects = `${dir}\\projects`;
    architects = `${dir}\\architects`;
}

export function getProjectImage(id) {
    return `${projects}\\${id}\\image.png`;
}

export function getProjectBackground(id) {
    return `${projects}\\${id}\\background.png`;
}