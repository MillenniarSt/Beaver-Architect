import { ProjectContext } from '../../../../stores/contexts';
import './Editors.css';
import { useState, useEffect, useContext } from 'react';

function TextFile({ file }) {

    const { page } = useContext(ProjectContext);

    const [savedText, saveText] = useState();
    const [text, setText] = useState();

    function save() {
        window.electron.writeTextFile(file, page.data.text).then(() => {
            saveText(text)
            page.data.savedText = text
            page.isSaved = true
        })
    }

    useEffect(() => {
        if(!page.data) {
            window.electron.readFileAsText(file).then((readed) => {
                saveText(readed)
                setText(readed)
                page.data = {savedText: readed, text: readed}
                page.isSaved = true
                page.save = save
            })
        } else {
            saveText(page.data.savedText)
            setText(page.data.text)
        }
    }, [file])

    if (text === undefined || savedText === undefined) {
        return (
            <div className='editor-organize'>
                <span style={{display: 'block', height: '45px'}} className='editor-title'>{file.substring(file.lastIndexOf('\\') + 1)}</span>
                <textarea value='Reading...' />
                <span style={{ fontSize: '14px' }}>{` > ${file}`}</span>
            </div>
        )
    }

    return (
        <div className='editor-organize'>
            <div className='editor-head'>
                <span className='editor-title'>{file.substring(file.lastIndexOf('\\') + 1) + (page.isSaved ? '' : '*')}</span>
                {!page.isSaved && <button className='secondary-button'>Cancel</button>}
                {!page.isSaved && <button className='decorated-button glow-hover' onClick={save}>Save</button>}
            </div>
            <textarea value={text} style={{ flexGrow: '1' }} onChange={(e) => {
                const changedText = e.target.value
                setText(changedText)
                page.data.text = changedText
                page.isSaved = savedText === changedText
            }} />
            <span style={{ fontSize: '14px' }}>{` > ${file}`}</span>
        </div>
    );
}

export default TextFile;