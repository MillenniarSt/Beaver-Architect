import { getProjectBackground, getProjectImage } from '../../data';
import defaultImage from '../../assets/default/image.png';
import defaultBackground from '../../assets/default/background.png';
import './EditProject.css';
import React, { useEffect, useState } from 'react';
import ImagePicker from '../../components/image-picker/ImagePicker';
import { BackPost, BackPut } from '../../fetch';
import { BaseErrorDialog } from '../dialog/dialogs';

function EditProject() {

  useEffect(() => {
    window.electron.getProjectEdit((e, data) => {
      setProject(data);

      let isNew = data === undefined || data._id === undefined;

      setName(data.name ?? '')
      setAuthors(data.authors ?? '')
      setDescription(data.description ?? '')
      setInfo(data.info ?? '')

      setImage(isNew ? defaultImage : getProjectImage(data._id));
      setBackground(isNew ? defaultBackground : getProjectBackground(data._id));
    });

    return () => {
      window.electron.getProjectEdit(() => { });
    };
  }, []);

  const [project, setProject] = useState();

  const isNew = project === undefined || project._id === undefined;

  const [name, setName] = useState('');
  const [authors, setAuthors] = useState('');
  const [description, setDescription] = useState('');
  const [info, setInfo] = useState('');

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
            <span className={name === 'input-label' && 'input-label-error'}>Name</span>
            <input placeholder='New Project' value={name} onChange={(e) => setName(e.target.value)} className={name === '' && 'error-input'}/>
          </div>
          <div style={{ flexGrow: 1 }}>
            <span className='input-label'>Authors</span>
            <input placeholder='Me and my Friends' value={authors} onChange={(e) => setAuthors(e.target.value)}/>
          </div>
        </div>
        <div>
          <span className='input-label'>Description</span>
          <input placeholder='A small description' value={description} onChange={(e) => setDescription(e.target.value)}/>
        </div>
        <div style={{ flexGrow: '1', display: 'flex', flexDirection: 'column' }}>
          <span className='input-label'>Info</span>
          <div style={{ flexGrow: '1', display: 'flex', gap: '15px' }}>
            <textarea style={{ flexGrow: '1' }} placeholder='Add more info to your Project' value={info} onChange={(e) => setInfo(e.target.value)}/>
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
      <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '5px' }}>
        <button className='decorated-button glow-hover' onClick={() => {
          const projectData = {
            name, authors, description, info, image, background, architect: project.architect, type: project.type
          }
          if(isNew) {
            BackPost('projects', projectData, (data) => {
              window.electron.openProject(data.project).then(() => window.electron.closeHome())
            }, (data) => {
              if(data.invalidName === true) {
                BaseErrorDialog({title: 'Invalid Name', message: 'The name of a project can not be empty'})
              }
            })
          } else {
            BackPut('projects', project._id, projectData, (data) => window.electron.openProject(data.project).then(() => window.electron.closeHome()))
          }
        }}>
          {isNew ? 'Create' : 'Modify'}
        </button>
        <button className='secondary-button' onClick={() => window.electron.closeEditProject()}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default EditProject;