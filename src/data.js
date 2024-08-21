export let dir;

export let projectsDir;
export let dataPacksDir;
export let architectsDir;

export async function init() {
    dir = await window.electron.getAppDataPath();
    console.log(dir);
    projectsDir = `${dir}\\projects`;
    dataPacksDir = `${dir}\\data_packs`;
    architectsDir = `${dir}\\architects`;
}

export function getProjectImage(id) {
    return `${projectsDir}\\${id}\\image.png`;
}

export function getProjectBackground(id) {
    return `${projectsDir}\\${id}\\background.png`;
}