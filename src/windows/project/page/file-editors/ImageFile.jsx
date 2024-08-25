import './Editors.css';

function ImageFile({ file }) {

    return (
        <div className='editor-organize'>
            <div className='editor-head'>
                <span className='editor-title'>{file.substring(file.lastIndexOf('\\') + 1)}</span>
            </div>
            <img src={file} className='editor-container'/>
            <span style={{ fontSize: '14px' }}>{` > ${file}`}</span>
        </div>
    );
}

export default ImageFile;