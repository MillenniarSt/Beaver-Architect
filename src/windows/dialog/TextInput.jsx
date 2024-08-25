import { useState, useEffect } from 'react';
import './Dialog.css';
import { error, report } from '../../icons';

function TextInput() {

    const [data, setData] = useState();
    const [text, setText] = useState();

    useEffect(() => {
        window.electron.getDialogData((e, data) => {
            setData(data);
            setText(data.display.value ?? '');
        });

        return () => {
            window.electron.getDialogData(() => { });
        };
    }, []);

    if (!data) {
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
                        <button className='decorated-button' style={{ backgroundColor: '#ea1010', outline: '0', flexGrow: '1' }} onClick={() => window.electron.closeAllDialogs()}>Ok</button>
                    </div>
                </div>
                <img src={error} className='dialog-icon' />
            </div>
        );
    }

    const { icon, color, title, message, placeholder } = data.display;

    return (
        <div className='dialog-container'>
            <div style={{ height: '60px' }} />
            <div style={{ borderColor: color ?? '#2D79CC' }} className='dialog'>
                <span className='dialog-title'>{title}</span>
                <p className='dialog-message'>{message}</p>
                <input placeholder={placeholder} value={text} onChange={(e) => setText(e.target.value)} />
                <div className='dialog-button-region'>
                    <button className='decorated-button' style={{flexGrow: '1'}} onClick={() => {
                        window.electron.closeDialog(data.id, {value: text});
                    }}>
                        Ok
                    </button>
                    <button className='secondary-button' style={{flexGrow: '1'}} onClick={() => {
                        window.electron.closeDialog(data.id, {skip: true});
                    }}>
                        Cancel
                    </button>
                </div>
            </div>
            <img src={icon} className='dialog-icon' />
        </div>
    );
}

export default TextInput;