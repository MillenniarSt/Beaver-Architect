import { error, info, warning } from "../../icons";
import { v4 as uuidv4 } from 'uuid';

function getRandomId() {
    return uuidv4()
}

let listeners = new Map()

window.electron.getDialogResult((e, result) => {
    const callback = listeners.get(result.id)
    if (callback) {
        callback(result.data)
    }
    listeners.delete(result.id)
})

function InfoDialog({ icon, color, title, message }) {
    window.electron.openDialog('base', 400, 350, getRandomId(), {
        icon: icon ?? info,
        color: color ?? '#2D79CC',
        title,
        message,
        buttons: [{ text: 'Ok', style: 'decorated-button glow-hover' }]
    });
}

function WarningDialog({ icon, color, title, message, no, yes }) {
    const id = getRandomId();
    window.electron.openDialog('base', 400, 350, id, {
        icon: icon ?? warning,
        color: color ?? '#F28618',
        title,
        message,
        buttons: [
            { text: 'Yes', colored: true, style: 'decorated-button' },
            { text: 'No', colored: 'border', style: 'secondary-button' }
        ]
    });
    listeners.set(id, (data) => {
        if (data.buttonIndex === 0) {
            yes()
        } else {
            no()
        }
    })
}

function BaseErrorDialog({ icon, color, title, message }) {
    window.electron.openDialog('base', 400, 350, getRandomId(), {
        icon: icon ?? error,
        color: color ?? '#ea1010',
        title,
        message,
        buttons: [{ text: 'Ok', colored: true, style: 'decorated-button' }]
    });
}

function ErrorDialog(err, { url }) {
    window.electron.openDialog('error', 400, 500, getRandomId(), { err, url });
}

/**
 * @param callback should be a function that receive the index of button clicked
 */
function ComboDialog({ icon, color, title, message, buttons, callback }) {
    const id = getRandomId()
    window.electron.openDialog('base', 400, 350, id, {
        icon: icon ?? info,
        color: color ?? '#2D79CC',
        title,
        message,
        buttons
    });
    listeners.set(id, (data) => {
        callback(data.buttonIndex)
    })
}

function TextInputDialog({ icon, color, title, message, value, placeholder, callback }) {
    const id = getRandomId()
    window.electron.openDialog('text', 400, 350, id, {
        icon: icon ?? info,
        color: color ?? '#2D79CC',
        title,
        message,
        value,
        placeholder
    });
    listeners.set(id, (data) => {
        if (data.value) {
            callback(data.value)
        }
    })
}

export { InfoDialog, WarningDialog, BaseErrorDialog, ErrorDialog, ComboDialog, TextInputDialog };