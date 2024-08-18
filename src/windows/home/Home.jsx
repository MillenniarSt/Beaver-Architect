import './Home.css';
import { useState } from 'react';
import logo from '../../assets/logo.png';
import Projects from './Projects';
import { add } from '../../icons';
import ChooseArchitect from './ChooseArchitect';

function Home() {

  const [projectType, selectProjectType] = useState(0);

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
          <button className={projectType === 0 ? 'selected' : 'unselected'} onClick={() => selectProjectType(0)}>Worlds</button>
          <button className={projectType === 1 ? 'selected' : 'unselected'} onClick={() => selectProjectType(1)}>Structures</button>
          <button className={projectType === 2 ? 'selected' : 'unselected'} onClick={() => selectProjectType(2)}>Layers</button>
          <hr style={{margin: '15px 30px'}}></hr>
          <button className={projectType === 3 ? 'selected' : 'unselected'} onClick={() => selectProjectType(3)}>Data Packs</button>
        </div>
      </div>
      <div className='foreground' id='projects'>
        <Projects setChooseArchitect={setChooseArchitect} />
      </div>
      {chooseArchitect && <ChooseArchitect close={() => setChooseArchitect(false)}/>}
    </div>
  );
}

export default Home;