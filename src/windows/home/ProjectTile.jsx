import { useState } from 'react';
import { getProjectImage, getProjectBackground } from '../../data';
import ContextMenu from '../../components/context-menu/ContextMenu';
import { edit, load, remove } from '../../icons';
import { BackDelete } from '../../fetch';

const initialContextMenu = {
    position: { x: 0, y: 0 },
    show: false
};

function ProjectTile({ project }) {

    const [contextMenu, setContextMenu] = useState(initialContextMenu);

    function handleContextMenu(e) {
        setContextMenu({
            position: { x: window?.innerWidth - e.clientX > 200 ? e.clientX : e.clientX - 200, y: e.clientY },
            show: true
        });
    }

    return (
        <>
            <div key={project.id} className='glow-hover project-tile' onContextMenu={(e) => handleContextMenu(e)} onClick={() => {
                window.electron.openProject(project).then(() => window.electron.closeHome());
            }}>
                <img src={getProjectBackground(project._id)} className='project-tile-background'></img>
                <div className='project-tile-foreground'>
                    <img src={getProjectImage(project._id)}></img>
                    <div style={{ flexGrow: '1', alignContent: 'center', padding: '0 10px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{project.name}</span>
                        <div style={{ height: '5px' }}></div>
                        <span style={{ fontSize: '16px' }}>{project.description}</span>
                    </div>
                </div>
            </div>
            {contextMenu.show && <ContextMenu x={contextMenu.position.x} y={contextMenu.position.y} title={project.name} items={[
                {
                    icon: load, text: 'Open', onClick: () => window.electron.openProject(project).then(() => window.electron.closeHome())
                },
                {
                    icon: edit, text: 'Modify', onClick: () => window.electron.openEditProject({ project })
                },
                { icon: remove, text: 'Delete', onClick: () => BackDelete('projects', project._id), color: '#db0c0c' }
            ]} close={() => setContextMenu(initialContextMenu)} />}
        </>
    );
}

export default ProjectTile;