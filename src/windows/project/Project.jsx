import './Project.css';
import { ProjectContext } from '../../stores/contexts';
import { getProjectBackground } from '../../data';
import { useEffect, useState } from 'react';
import SplitPane, { Pane } from 'react-split-pane';
import Sidebar from './sidebar/Sidebar';
import types from './types';
import { close } from '../../icons';

function Project() {

    const [showSidebar, setShowSidebar] = useState(true);
    const [project, setProject] = useState();

    /**
     * Page format should be:
     *   @param id - unique string
     *   @param icon - display icon
     *   @param name - display name
     *   @param component - function to build the page
     */
    const [selectedPage, selectPage] = useState(null);
    const [pages, setPages] = useState([]);

    useEffect(() => {
        window.electron.getProject((e, data) => {
            setProject(data);
        });

        return () => {
            window.electron.getProject(() => { });
        };
    }, []);

    if (project === undefined) {
        return (
            <div>

            </div>
        );
    }

    return (
        <ProjectContext.Provider value={{ project, setProject }}>
            <img src={getProjectBackground(project._id)} className='project-background' />
            <SplitPane split='vertical' minSize={300} maxSize={600} size={showSidebar ? 350 : 70}>
                <Sidebar bars={types[project.type].sidebar} show={showSidebar} setShow={setShowSidebar} addPage={(page) => setPages([...pages, page])}/>
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{display: 'flex'}}>
                        {pages.map((page) => (
                            <div className={page.id === selectedPage ? 'select-tab' : 'unselect-tab'} onClick={() => selectPage(page.id)}>
                                <img src={page.icon} className='icon' />
                                <span>{page.name}</span>
                                {page.id === selectedPage ?
                                    <img src={close} className='icon-button' onClick={() => setPages(pages.filter((i) => i.id !== page.id))}/> :
                                    <div style={{ width: '24px' }} />}
                            </div>
                        ))}
                        <div style={{flexGrow: '1', borderBottom: 'solid 2px #efefef'}}/>
                    </div>
                    <div style={{flexGrow: '1'}}>

                    </div>
                </div>
            </SplitPane>
        </ProjectContext.Provider >
    );
}

export default Project;