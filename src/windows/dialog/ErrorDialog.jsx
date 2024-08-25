import { useState, useEffect } from 'react';
import './Dialog.css';
import { error, infoUrl, report } from '../../icons';

const empty = {};

function ErrorDialog() {

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
                        <button className='decorated-button' style={{ backgroundColor: '#ea1010', outline: '0', flexGrow: '1' }} onClick={() => window.electron.closeAllDialogs()}>Ok</button>
                    </div>
                </div>
                <img src={error} className='dialog-icon' />
            </div>
        );
    }

    const { err, url } = data.display;

    return (
        <div className='dialog-container'>
            <div style={{ height: '60px' }} />
            <div style={{ borderColor: '#ea1010' }} className='dialog'>
                <span className='dialog-title'>{err.name}</span>
                <p style={{ flexGrow: 0 }} className='dialog-message'>{err.message}</p>
                <p className='dialog-stack'>{err.stack}</p>
                <div style={{ padding: '0 15px' }}>
                    <div style={{ display: 'flex', textAlign: 'center' }}>
                        <span style={{ flexGrow: '1', fontSize: '14px'}}>{`Code: ${err.errno}`}</span>
                        <span style={{ flexGrow: '1', fontSize: '14px'}}>{`System: ${err.syscall}`}</span>
                    </div>
                    {url !== undefined && <div style={{ display: 'flex', gap: '10px' }}>
                        <img src={infoUrl} className='dialog-url' />
                        <span style={{fontSize: '12px'}}>{url}</span>
                    </div>}
                </div>
                <div className='dialog-button-region'>
                    <button className='decorated-button' style={{ backgroundColor: '#ea1010', outline: '0', flexGrow: '1' }} onClick={() => window.electron.closeDialog(data.id, {})}>Ok</button>
                </div>
            </div>
            <img src={error} className='dialog-icon' />
            <img src={report} className='dialog-report' onClick={() => {
                window.open("TODO");
            }} />
        </div>
    );
}

export default ErrorDialog;