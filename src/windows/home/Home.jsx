import './Home.css';
import { useState } from 'react';
import logo from '../../assets/logo.png';
import Projects from './Projects';
import { add } from '../../icons';
import ChooseArchitect from './ChooseArchitect';

function Home() {

  const [projectType, selectProjectType] = useState('world');

  const [chooseArchitect, setChooseArchitect] = useState(false);

  return (
    <div className='background' id='home'>
      <div id='navigation'>
        <div className='glow' id='credit-label'>
          <img id='logo' src={logo}></img>
          <div>
            <h3 style={{margin: 0}}>Beaver Architect</h3>
            <span style={{fontSize: '14px'}}><em>By Millenniar</em></span>
          </div>
        </div>
        <div style={{margin: '60px 10px 30px 10px', cursor: 'pointer'}} className='decorated-label' onClick={() => setChooseArchitect(true)}>
          <div className='decorated-icon glow'>
            <img src={add}/>
          </div>
          <span style={{fontSize: '18px', fontWeight: '500'}}>New Project</span>
        </div>
        <div style={{padding: '20px'}}>
          <button className={projectType === 'world' ? 'selected' : 'unselected'} onClick={() => selectProjectType('world')}>Worlds</button>
          <button className={projectType === 'structure' ? 'selected' : 'unselected'} onClick={() => selectProjectType('structure')}>Structures</button>
          <button className={projectType === 'terrain' ? 'selected' : 'unselected'} onClick={() => selectProjectType('terrain')}>Layers</button>
          <hr style={{margin: '15px 30px'}}></hr>
          <button className={projectType === 'data-pack' ? 'selected' : 'unselected'} onClick={() => selectProjectType('data-pack')}>Data Packs</button>
        </div>
      </div>
      <div className='foreground' id='projects'>
        <Projects type={projectType} setChooseArchitect={setChooseArchitect} />
      </div>
      {chooseArchitect && <ChooseArchitect close={() => setChooseArchitect(false)}/>}
    </div>
  );
}

export default Home;