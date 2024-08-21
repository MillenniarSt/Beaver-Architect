import { getProjectBackground, getProjectImage } from '../../data';
import defaultImage from '../../assets/default/image.png';
import defaultBackground from '../../assets/default/background.png';
import './EditProject.css';
import React, { useEffect, useState } from 'react';
import ImagePicker from '../../components/image-picker/ImagePicker';

function EditProject() {

  useEffect(() => {
    window.electron.getProjectEdit((e, data) => {
      setProject(data);

      let isNew = data === undefined || data._id === undefined;

      setImage(isNew ? defaultImage : getProjectImage(data._id));
      setBackground(isNew ? defaultBackground : getProjectBackground(data._id));
    });

    return () => {
      window.electron.getProjectEdit(() => { });
    };
  }, []);

  const [project, setProject] = useState();

  let isNew = project === undefined || project._id === undefined;

  const [image, setImage] = useState(defaultImage);
  const [background, setBackground] = useState(defaultBackground);

  if (project === undefined) {
    return <div className='background'></div>;
  }

  return (
    <div className='background edit-project'>
      <span style={{ fontSize: '20px', marginLeft: '10px', fontWeight: '500' }}>{isNew ? 'Create New Project' : `Modify ${project.name}`}</span>
      <form style={{ flexGrow: '1', borderRadius: '30px' }} className='foreground'>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flexGrow: 1 }}>
            <span className='input-label'>Name</span>
            <input placeholder='New Project' value={project.name}/>
          </div>
          <div style={{ flexGrow: 1 }}>
            <span className='input-label'>Authors</span>
            <input placeholder='Me and my Friends' value={project.authors}/>
          </div>
        </div>
        <div>
          <span className='input-label'>Description</span>
          <input placeholder='A small description' value={project.description}/>
        </div>
        <div style={{ flexGrow: '1', display: 'flex', flexDirection: 'column' }}>
          <span className='input-label'>Info</span>
          <div style={{ flexGrow: '1', display: 'flex', gap: '15px' }}>
            <textarea style={{ flexGrow: '1' }} placeholder='Add more info to your Project' value={project.info}/>
            <div style={{ width: '500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ position: 'relative', height: '152px' }}>
                <ImagePicker title='Image' empty={defaultImage} image={image} setImage={setImage} />
              </div>
              <div style={{ position: 'relative', height: '152px' }}>
                <ImagePicker title='Background' empty={defaultBackground} image={background} setImage={setBackground} />
              </div>
            </div>
          </div>
        </div>
      </form>
      <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <button className='glow-hover' onClick={() => {
          //TODO
          window.electron.closeEditProject()
        }}>
          {isNew ? 'Create' : 'Modify'}
        </button>
        <button onClick={() => window.electron.closeEditProject()}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default EditProject;