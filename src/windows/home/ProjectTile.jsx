import { useState } from 'react';
import { getProjectImage, getProjectBackground } from '../../data';
import ContextMenu from '../../components/context-menu/ContextMenu';
import { edit, load, remove } from '../../icons';

const initialContextMenu = {
    position: {x: 0, y: 0},
    show: false
};

function ProjectTile({ project }) {

    const [contextMenu, setContextMenu] = useState(initialContextMenu);

    function handleContextMenu(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setContextMenu({
            position: {x: window?.innerWidth - e.clientX > 200 ? x : x - 200, y},
            show: true
        });
    }

    return(
        <div key={project.id} className='glow-hover project-tile' onContextMenu={(e) => handleContextMenu(e)}>
            <img src={getProjectBackground(project.id)} className='project-tile-background'></img>
            <div className='project-tile-foreground'>
                <img src={getProjectImage(project.id)}></img>
                <div style={{flexGrow: '1', alignContent: 'center', padding: '0 10px'}}>
                    <span style={{fontSize: '24px', fontWeight: 'bold'}}>{project.name}</span>
                    <div style={{height: '5px'}}></div>
                    <span style={{fontSize: '16px'}}>{project.description}</span>
                </div>
            </div>
            {contextMenu.show && <ContextMenu x={contextMenu.position.x} y={contextMenu.position.y} title={project.name} items={[
                {icon: load, text: 'Open', onClick: () => {}},
                {icon: edit, text: 'Modify', onClick: () => {}},
                {icon: remove, text: 'Delete', onClick: () => {}, color: '#db0c0c'}
            ]} close={() => setContextMenu(initialContextMenu)}/>}
        </div>
    );
}

export default ProjectTile;