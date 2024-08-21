import { error, info, warning } from "../../icons";

function Info(title, message) {
    window.electron.openDialog('base', 400, 350, {
        icon: info,
        color: '#2D79CC',
        title,
        message,
        buttons: [{text: 'Ok', style: 'glow-hover'}]
    });
}

function Warning(title, message, proceed) {
    window.electron.openDialog('base', 400, 350, {
        icon: warning,
        color: '#F28618',
        title,
        message,
        buttons: [
            {text: 'Cancel', colored: 'border'},
            {text: 'Proceed', colored: 'fill', onclick: proceed}
        ]
    });
}

function BaseError(title, message) {
    window.electron.openDialog('base', 400, 350, {
        icon: error,
        color: '#ea1010',
        title,
        message,
        buttons: [{text: 'Ok', colored: 'fill'}]
    });
}

function Error(err, { url }) {
    window.electron.openDialog('error', 400, 500, {err, url: url});
}

export { Info, Warning, BaseError, Error };