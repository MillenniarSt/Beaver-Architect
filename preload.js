const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getAppDataPath: () => ipcRenderer.invoke('get:app-data-path'),

    openHome: () => ipcRenderer.invoke('open:home'),
    openEditProject: (data) => ipcRenderer.invoke('open:edit-project', data),
    closeHome: () => ipcRenderer.invoke('close:home'),
    closeEditProject: () => ipcRenderer.invoke('close:edit-project'),

    openFile: (data) => ipcRenderer.invoke('dialog:openFile', data),
    
    getProjectEdit: (data) => ipcRenderer.on('project-edit:get', data)
});