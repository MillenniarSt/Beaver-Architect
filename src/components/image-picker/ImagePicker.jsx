import './ImagePicker.css';
import { remove } from '../../icons';

function ImagePicker({ title, empty, image, setImage }) {

    return (
        <>
            <span className='image-picker-label'>{title}</span>
            {image !== empty && <span className='image-picker-path'>{image}</span>}
            {image !== empty && <img src={remove} className='image-picker-remove' onClick={() => setImage(empty)}/>}
            <img src={image} className='image-picker' onClick={async () => {
                let selectImage = await window.electron.openFile({name: 'Images', extensions: ['png', 'jpg', 'jpeg']});
                if(selectImage !== null) {
                    setImage(selectImage);
                }
            }}/>
        </>
    );
}

export default ImagePicker;