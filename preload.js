const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // General Getter --> main.js
    getAppDataPath: () => ipcRenderer.invoke('get:app-data-path'),
    getTreeFiles: (dir) => ipcRenderer.invoke('get:tree-files', dir),

    // File manager --> main.js
    readFileAsText: (file) => ipcRenderer.invoke('file:read-text', file),
    writeTextFile: (file, text) => ipcRenderer.invoke('file:write-text', {file, text}),
    createDir: (dir) => ipcRenderer.invoke('file:create-dir', {dir}),
    renameFile: (file, rename) => ipcRenderer.invoke('file:rename', {file, rename}),
    deleteFile: (file) => ipcRenderer.invoke('file:delete', {file}),

    // Architects --> main.js
    getArchitects: (data) => ipcRenderer.invoke('architect:get-all', data),

    // Dialogs --> dialog/window
    openFile: (data) => ipcRenderer.invoke('dialog:open-file', data),
    openDialog: (type, width, height, id, display) => ipcRenderer.invoke('dialog:open', {type, width, height, id, display}),
    getDialogData: (callback) => ipcRenderer.on('dialog:get', callback),
    closeDialog: (id, data) => ipcRenderer.invoke('dialog:close', {id, data}),
    getDialogResult: (callback) => ipcRenderer.on('dialog:result', callback),
    closeAllDialogs: () => ipcRenderer.invoke('dialog:close-all'),

    // Home --> home/window
    openHome: () => ipcRenderer.invoke('home:open'),
    closeHome: () => ipcRenderer.invoke('home:close'),

    // Edit Project --> edit-project/window
    openEditProject: (data) => ipcRenderer.invoke('edit-project:open', data),
    getProjectEdit: (callback) => ipcRenderer.on('project-edit:get', callback),
    closeEditProject: () => ipcRenderer.invoke('edit-project:close'),

    // Project --> project/window
    openProject: (project) => ipcRenderer.invoke('project:open', project),
    getProject: (callback) => ipcRenderer.on('project:get', callback),
    closeProject: (id) => ipcRenderer.invoke('project:close', id)
});