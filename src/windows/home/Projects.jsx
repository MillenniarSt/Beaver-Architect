import { useState, useEffect } from 'react';
import { world, left, right, add } from '../../icons';
import ProjectTile from './ProjectTile';
import { Get } from '../../fetch';

function Projects({ type, setChooseArchitect }) {

    const [architects, setArchitects] = useState([{ icon: world, name: "All" }]);
    const [projects, setProjects] = useState([]);

    const [architect, selectArchitect] = useState(0);

    useEffect(() => {
        Get('projects/', {type}, (data) => setProjects(data.projects));
    }, []);

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
                    architect > 0 &&
                    <button className='architect-navigate' onClick={() => selectArchitect(architect - 1)}>
                        <img src={left} className='icon'></img>
                    </button>
                }
                <div id="architect-label">
                    <img src={architects[architect].icon} className='icon'></img>
                    <span><strong>{architects[architect].name}</strong></span>
                </div>
                {
                    architect < architects.length - 1 &&
                    <button className='architect-navigate' onClick={() => selectArchitect(architect + 1)}>
                        <img src={right} className='icon'></img>
                    </button>
                }
            </div>
            <div style={{ flexGrow: 1 }}>
                {
                    projects.filter((project) => architect === 0 || project.architect === architect).map((project) => <ProjectTile project={project} />)
                }
            </div>
        </div>
    );
}

export default Projects;