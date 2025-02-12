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

import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow"
import { FormInputData, FormOutput } from "../components/form/inputs/inputs"

export type SettingGroup = {
    icon?: string,
    label: string
    groups?: SettingGroup[]
    settings?: Setting[]
}

export type Setting = { type: string } & FormInputData<any, any, any>

export const clientSettings: {
    devMode: boolean
    debug: boolean
} = {
    devMode: false,
    debug: false
}

export function getClientSettingsGroups(): SettingGroup[] {
    return [
        {
            icon: 'pi pi-code',
            label: 'Advanced',
            settings: [
                { type: 'checkbox', id: 'debug', display: { label: 'Show Debug Messages' }, value: clientSettings.debug },
                { type: 'checkbox', id: 'devMode', display: { label: 'Use Developer Mode' }, value: clientSettings.devMode }
            ]
        }
    ]
}

export function openSettings(settingsGroups: SettingGroup[], onEdit: (output: FormOutput<any>) => void, title = 'Settings') {
    const win = new WebviewWindow('settings', {
        url: 'index.html#/settings',
        parent: getCurrentWebviewWindow(),

        title: title,
        center: true,
        width: 800,
        height: 500,
        shadow: true
    })

    win.once('tauri://created', () => {
        win.once('settings:ready', async () => {
            await win.emit('settings:get', {
                groups: settingsGroups
            })
        })
        win.listen<FormOutput<any>>('settings:edit', async (event) => {
            onEdit(event.payload)
        })
    })

    win.once('tauri://error', (e) => {
        console.error('Window Settings Error:', e)
    })
}