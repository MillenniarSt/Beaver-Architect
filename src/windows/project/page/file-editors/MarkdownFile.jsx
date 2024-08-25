import { ProjectContext } from '../../../../stores/contexts';
import { useState, useEffect, useContext } from 'react';
import React from "react";
import MDEditor from '@uiw/react-md-editor';
import './Editors.css';

function MarkdownFile({ file }) {

    const { page } = useContext(ProjectContext);

    const [savedText, saveText] = useState();
    const [text, setText] = useState();

    function save() {
        window.electron.writeTextFile(file, text).then(() => {
            saveText(text)
            page.data.savedText = text
            page.isSaved = true
        })
    }

    useEffect(() => {
        if (!page.data) {
            window.electron.readFileAsText(file).then((readed) => {
                saveText(readed)
                setText(readed)
                page.data = { savedText: readed, text: readed }
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
                {!page.isSaved && <button className='secondary-button'>Cancel</button>}
                {!page.isSaved && <button className='decorated-button glow-hover' onClick={save}>Save</button>}
            </div>
            <MDEditor
                value={text}
                onChange={(change) => {
                    setText(change)
                    page.data.text = change
                    page.isSaved = savedText === change
                }}
                style={{ flexGrow: '1' }}
            />
            <span style={{ fontSize: '14px' }}>{` > ${file}`}</span>
        </div>
    );
}

export default MarkdownFile;