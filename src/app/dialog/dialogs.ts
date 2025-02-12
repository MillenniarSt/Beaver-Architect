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

import { Effect, WindowOptions } from "@tauri-apps/api/window"
import { BaseDialog, DialogButton } from "./base/base.component"
import { getCurrentWebviewWindow, WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { WebviewOptions } from "@tauri-apps/api/webview"

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
        severity: 'info',
        title,
        message,
        buttons: [{ label: 'OK', severity: 'info', focus: true }]
    }
}

export function warnDialog(title: string, message: string): BaseDialog {
    return {
        icon: 'assets/icon/warning.svg',
        severity: 'warn',
        title,
        message,
        buttons: [
            { label: 'Proceed', severity: 'warn', id: 1 },
            { label: 'Cancel', severity: 'secondary' }
        ]
    }
}

export function baseErrorDialog(title: string, message: string): BaseDialog {
    return {
        icon: 'assets/icon/error.svg',
        severity: 'error',
        title,
        message,
        buttons: [{ label: 'OK', severity: 'danger' }],
        hasReport: true
    }
}

export function openBaseDialog(dialog: BaseDialog, width: number = 500, height: number = 300): Promise<number> {
    return open('base', {
        title: dialog.title,
        center: true,
        width, height,
        resizable: false,
        minimizable: false,
        closable: false,
        decorations: false,
        transparent: true,
        skipTaskbar: true,
        shadow: true
    }, dialog)
}

export function openErrorDialog(err: any, url?: string, width: number = 500, height: number = 400): Promise<void> {
    return open('error', {
        title: 'Error',
        width, height,
        center: true,
        minimizable: false,
        decorations: false,
        transparent: true,
        skipTaskbar: true,
        shadow: true
    }, { err, url })
}

export function openInputDialog(dialog: InputDialog, width: number = 500, height: number = 250): Promise<{
    value: string
}> {
    return open('input', {
        title: dialog.title,
        width, height,
        center: true,
        resizable: false,
        minimizable: false,
        closable: false,
        decorations: false,
        transparent: true,
        skipTaskbar: true,
        shadow: true
    }, dialog)
}

function open<T>(hash: string, options: WindowOptions, data?: any): Promise<T> {
    return new Promise((resolve) => {
        (options as WebviewOptions).url = `index.html#/dialog-${hash}`
        options.parent = getCurrentWebviewWindow()
        const dialog = new WebviewWindow('dialog', options)

        dialog.once('tauri://created', () => {
            dialog.once('dialog:ready', () => dialog.emit('dialog:get', data ?? {}))
        })

        dialog.once('tauri://error', (e) => {
            console.error('Dialog Error:', e)
        })

        dialog.once<T>('dialog:close', (data) => resolve(data.payload))
    })
}