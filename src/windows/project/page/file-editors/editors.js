import { BackGet } from '../../../../fetch';
import { file, fileJson, fileText } from "../../../../icons";
import TextFile from "./TextFile";

/** 
 * Connect the file extension to an editor
 * This data came from local database so before using @var editors invoke @function ensureEditors(then)
 */
let editors;

/**
 * Define default file editors
 * More editors can be added by plugins
 */
const beaverEditors = {
    text: { icon: fileText, page: (file) => <TextFile file={file} /> },
    markdown: { icon: fileText, page: (file) => <TextFile file={file} /> },
    json: { icon: fileJson, page: (file) => <TextFile file={file} /> },
    image: { icon: file, page: (file) => <TextFile file={file} /> }
}

async function reloadEditors(then) {
    BackGet('settings/file-editors', {}, (data) => {
        editors = data;
        then(editors);
    });
}

async function ensureEditors(then) {
    if(editors === undefined) {
        reloadEditors(then);
    } else {
        then(editors);
    }
    Math.max(0, 1)
}

function getSourceEditor(file) {
    return editors[file.substring(file.lastIndexOf('.') + 1)].split(':');
}

function getEditorIcon(file) {
    const [source, editor] = getSourceEditor(file);
    if (source === 'beaver') {
        return beaverEditors[editor].icon;
    } else {
        return file;
    }
}

function getEditorPage(file) {
    const [source, editor] = getSourceEditor(file);
    if (source === 'beaver') {
        return beaverEditors[editor].page(file);
    } else {
        return null;
    }
}

export { beaverEditors, reloadEditors, ensureEditors, getSourceEditor, getEditorIcon, getEditorPage };