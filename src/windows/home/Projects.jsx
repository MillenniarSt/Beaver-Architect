import { useState, useEffect } from 'react';
import { world, left, right, add } from '../../icons';
import ProjectTile from './ProjectTile';
import { BackGet } from '../../fetch';
import { architectsDir } from '../../data';

function Projects({ type, setChooseArchitect }) {

    const [architects, setArchitects] = useState([{ icon: world, name: "All" }]);
    const [projects, setProjects] = useState([]);

    const [architect, selectArchitect] = useState(0);

    useEffect(() => {
        window.electron.getArchitects().then((architects) => setArchitects([{ icon: world, name: "All" }, ...architects]))
    }, []);

    useEffect(() => {
        BackGet('projects', architect === 0 ? {type} : {type, architect: architects[architect].identifier}, (data) => setProjects(data.projects));
    }, [type, architect]);

    if (projects.length === 0) {
        return (
            <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column', alignItems: 'center', placeContent: 'center', cursor: 'pointer' }} onClick={() => setChooseArchitect(true)}>
                <div className='big-decorated-icon glow'>
                    <img src={add} />
                </div>
                <span style={{ fontSize: '18px', marginTop: '10px' }}>Create New Project</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
            <div id="architect-selector">
                {
                    architect > 0 ?
                    <button className='architect-navigate' onClick={() => selectArchitect(architect - 1)}>
                        <img src={left} className='icon'></img>
                    </button> :
                    <div style={{width: 50}} />
                }
                <div id="architect-label">
                    <img src={architects[architect].icon ?? architectsDir + "\\" + architects[architect].identifier + "\\icon.svg"} className='icon'></img>
                    <span><strong>{architects[architect].name}</strong></span>
                </div>
                {
                    architect < architects.length - 1 ?
                    <button className='architect-navigate' onClick={() => selectArchitect(architect + 1)}>
                        <img src={right} className='icon'></img>
                    </button> :
                    <div style={{width: 50}} />
                }
            </div>
            <div style={{ flexGrow: 1 }}>
                {
                    projects.map((project) => <ProjectTile project={project} />)
                }
            </div>
        </div>
    );
}

export default Projects;