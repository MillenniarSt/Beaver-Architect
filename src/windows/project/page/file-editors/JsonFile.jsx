import { ProjectContext } from '../../../../stores/contexts';
import { useState, useEffect, useContext } from 'react';
import { JsonEditor as Editor } from 'jsoneditor-react';

import '@contentful/forma-36-react-components/dist/styles.css'
import './Editors.css';
import { WarningDialog } from '../../../dialog/dialogs';

function JsonFile({ file }) {

    const { page } = useContext(ProjectContext);

    const [json, setJson] = useState();
    const [isSaved, setSaved ] = useState(true);

    useEffect(() => {
        if (!page.data) {
            window.electron.readFileAsText(file).then((readed) => {
                const readedJson = JSON.parse(readed)
                setJson(readedJson)
                setSaved(true)
                page.data = { json: readedJson }
                page.isSaved = true
                page.save = () => window.electron.writeTextFile(file, JSON.stringify(page.data.json))
            })
        } else {
            setJson(page.data.json)
        }
    }, [file])

    if (json === undefined) {
        return (
            <div className='editor-organize'>
                <span style={{ display: 'block', height: '45px' }} className='editor-title'>{file.substring(file.lastIndexOf('\\') + 1)}</span>
                <div style={{flexGrow: '1'}}>Reading...</div>
                <span style={{ fontSize: '14px' }}>{` > ${file}`}</span>
            </div>
        )
    }

    return (
        <div className='editor-organize'>
            <div className='editor-head'>
                <span className='editor-title'>{file.substring(file.lastIndexOf('\\') + 1) + (page.isSaved ? '' : '*')}</span>
                {!page.isSaved && <button className='secondary-button' onClick={() => {
                    WarningDialog('Cancel Changes', 'Are you sure to delete all your changes?', () => window.electron.readFileAsText(file).then((readed) => {
                        const readedJson = JSON.parse(readed)
                        setJson(readedJson)
                        page.data = { json: readedJson }
                        page.isSaved = true
                    }))
                }}>Cancel</button>}
                {!page.isSaved && <button className='decorated-button glow-hover' onClick={() => {
                    window.electron.writeTextFile(file, JSON.stringify(json))
                    setSaved(true)
                    page.isSaved = true
                }}>Save</button>}
            </div>
            <div className='editor'>
                <Editor
                    mode="tree"
                    history
                    value={json}
                    onChange={(change) => {
                        setJson(change)
                        page.data.json = change
                        page.isSaved = false
                    }}
                />
            </div>
            <span style={{ fontSize: '14px' }}>{` > ${file}`}</span>
        </div>
    );
}

export default JsonFile;