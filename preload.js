const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getAppDataPath: () => ipcRenderer.invoke('get:app-data-path'),
    getTreeFiles: (dir) => ipcRenderer.invoke('get:tree-files', dir),

    getArchitects: (data) => ipcRenderer.invoke('architect:get-all', data),

    openFile: (data) => ipcRenderer.invoke('dialog:openFile', data),
    openDialog: (type, width, height, display) => ipcRenderer.invoke('dialog:open', {type, width, height, display}),
    getDialogData: (data) => ipcRenderer.on('dialog:get', data),
    closeDialog: (id) => ipcRenderer.invoke('dialog:close', id),
    closeAllDialogs: () => ipcRenderer.invoke('dialog:close-all'),

    openHome: () => ipcRenderer.invoke('home:open'),
    closeHome: () => ipcRenderer.invoke('home:close'),

    openEditProject: (data) => ipcRenderer.invoke('edit-project:open', data),
    getProjectEdit: (data) => ipcRenderer.on('project-edit:get', data),
    closeEditProject: () => ipcRenderer.invoke('edit-project:close'),

    openProject: (project) => ipcRenderer.invoke('project:open', project),
    getProject: (data) => ipcRenderer.on('project:get', data),
    closeProject: (id) => ipcRenderer.invoke('project:close', id)
});