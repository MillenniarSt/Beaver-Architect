//             _____
//         ___/     \___        |  |
//      ##/  _.- _.-    \##  -  |  |                       -
//      ##\#=_  '    _=#/##  |  |  |  /---\  |      |      |   ===\  |  __
//      ##   \\#####//   ##  |  |  |  |___/  |===\  |===\  |   ___|  |==/
//      ##       |       ##  |  |  |  |      |   |  |   |  |  /   |  |
//      ##       |       ##  |  \= \= \====  |   |  |   |  |  \___/  |
//      ##\___   |   ___/
//      ##    \__|__/
//

import { DialogButton } from "./base/base.component"

type BaseDialog = {
    icon?: string,
    color?: string
    title: string,
    message: string,
    buttons?: DialogButton[],
    hasReport?: boolean
}

type InputDialog = {
    icon?: string,
    color?: string
    title: string,
    message?: string,
    initial?: string,
    placeholder?: string
}

export function infoDialog(title: string, message: string): BaseDialog {
    return {
        icon: 'assets/icon/info.svg',
        color: 'info',
        title,
        message,
        buttons: [{name: 'OK', color: 'info', focus: true}]
    }
}

export function warnDialog(title: string, message: string): BaseDialog {
    return {
        icon: 'assets/icon/warning.svg',
        color: 'warn',
        title,
        message,
        buttons: [
            {name: 'Proceed', color: 'warn', id: 1},
            {name: 'Cancel'}
        ]
    }
}

export function baseErrorDialog(title: string, message: string): BaseDialog {
    return {
        icon: 'assets/icon/error.svg',
        color: 'error',
        title,
        message,
        buttons: [{name: 'OK', color: 'error'}],
        hasReport: true
    }
}

export function openBaseDialog(dialog: BaseDialog, width?: number, height?: number): Promise<number> {
    return new Promise((resolve) => {
        const { ipcRenderer } = window.require('electron')

        ipcRenderer.invoke('dialog:open', {
            type: 'base',
            width: width ?? 500,
            height: height ?? 400,
            display: dialog
        })

        ipcRenderer.once('dialog:result', (e, data) => {
            resolve(data)
        })
    })
}

export function openErrorDialog(err: any, url?: string, width?: number, height?: number): Promise<void> {
    return new Promise((resolve) => {
        const { ipcRenderer } = window.require('electron')

        ipcRenderer.invoke('dialog:open', {
            type: 'error',
            width: width ?? 500,
            height: height ?? 600,
            resizable: true,
            display: { err, url }
        })

        ipcRenderer.once('dialog:result', () => {
            resolve()
        })
    })
}

export function openInputDialog(dialog: InputDialog, width?: number, height?: number): Promise<string> {
    return new Promise((resolve) => {
        const { ipcRenderer } = window.require('electron')

        ipcRenderer.invoke('dialog:open', {
            type: 'input',
            width: width ?? 500,
            height: height ?? 400,
            display: dialog
        })

        ipcRenderer.once('dialog:result', (e, data) => {
            resolve(data)
        })
    })
}