import { useState, useEffect } from 'react';
import './Dialog.css';
import { error, report } from '../../icons';

const empty = {};

function Dialog() {

    const [data, setData] = useState(empty);

    useEffect(() => {
        window.electron.getDialogData((e, data) => {
            setData(data);
        });

        return () => {
            window.electron.getDialogData(() => { });
        };
    }, []);

    if (data === empty) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ height: '60px' }} />
                <div style={{ borderColor: '#ea1010' }} className='dialog'>
                    <span className='dialog-title'>Unexpected Error</span>
                    <p className='dialog-message'>
                        No data was received for this dialog
                        Please report the problem by clicking on the (!)
                    </p>
                    <div className='dialog-button-region'>
                        <button style={{ backgroundColor: '#ea1010', outline: '0' }} onClick={() => window.electron.closeAllDialogs()}>Ok</button>
                    </div>
                </div>
                <img src={error} className='dialog-icon' />
            </div>
        );
    }

    const { icon, color, title, message, buttons, reportData } = data.display;

    return (
        <div className='dialog-container'>
            <div style={{ height: '60px' }} />
            <div style={{ borderColor: color ?? '#2D79CC' }} className='dialog'>
                <span className='dialog-title'>{title}</span>
                <p className='dialog-message'>{message}</p>
                <div className='dialog-button-region'>
                    {buttons.map((button, index) => (
                        <button key={index}
                            style={button.colored === 'fill' ? { backgroundColor: color, outline: '0' } : (button.colored === 'border' ? { outlineColor: color } : {})}
                            className={button.style}
                            onClick={() => {
                                window.electron.closeDialog(data.id);
                                button.onClick();
                            }}>
                            {button.text}
                        </button>
                    ))}
                </div>
            </div>
            <img src={icon} className='dialog-icon' />
            {reportData !== undefined && <img src={report} className='dialog-report' onClick={() => {
                window.open("TODO");
            }} />}
        </div>
    );
}

export default Dialog;