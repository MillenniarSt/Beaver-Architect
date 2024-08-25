import './Project.css';
import { ProjectContext } from '../../stores/contexts';
import { getProjectBackground } from '../../data';
import { useEffect, useState } from 'react';
import SplitPane, { Pane } from 'react-split-pane';
import Sidebar from './sidebar/Sidebar';
import types from './types';
import { add, close, warning } from '../../icons';
import { ComboDialog, WarningDialog } from '../dialog/dialogs';

function Project() {

    const [showSidebar, setShowSidebar] = useState(true);
    const [project, setProject] = useState();

    /**
     * Page format should be:
     *   @param id - unique id
     *   @param icon - display icon
     *   @param name - display name
     *   @param component - function to build the page
     *   @param data - saved data to prevent any lose of data when the page changes
     *   @param isSaved - has changes to save (if true need @param save)
     *   @param save - function to save the page
     */
    let [selectedPage, selectPage] = useState(null);
    const [pages, setPages] = useState([]);

    useEffect(() => {
        window.electron.getProject((e, data) => {
            setProject(data);
        });

        return () => {
            window.electron.getProject(() => { });
        };
    }, []);

    if (pages.length === 0) {
        selectedPage = null;
    } else if (selectedPage >= pages.length) {
        selectedPage = pages.length - 1;
    }

    if (project === undefined) {
        return (
            <div>

            </div>
        );
    }

    function closePage(index) {
        const updatedPages = [...pages];
        updatedPages.splice(index, 1);
        setPages(updatedPages);
    }

    return (
        <ProjectContext.Provider value={{ project, setProject, page: pages[selectedPage] }}>
            <img src={getProjectBackground(project._id)} className='project-background' />
            <SplitPane split='vertical' minSize={300} maxSize={600} size={showSidebar ? 350 : 70}>
                <Sidebar bars={types[project.type].sidebar} show={showSidebar} setShow={setShowSidebar} addPage={(page) => {
                    setPages([...pages, page])
                    selectPage(pages.length)
                }} />
                {selectedPage !== null ?
                    <div className='project-pages'>
                        <div style={{ display: 'flex' }}>
                            {pages.map((page, index) => (
                                <div className={index === selectedPage ? 'select-tab' : 'unselect-tab'} onClick={() => selectPage(index)}>
                                    <img src={page.icon} className='small-icon' />
                                    <span style={{ fontSize: '14px' }}>{page.name}</span>
                                    {index === selectedPage ?
                                        <img src={close} className='small-icon-button' onClick={() => {
                                            if (page.isSaved === false) {
                                                WarningDialog({
                                                    title: 'Unsaved Changes',
                                                    message: 'Would you like to save changes?',
                                                    yes: () => {
                                                        page.save()
                                                        closePage(index)
                                                    },
                                                    no: () => closePage(index)
                                                })
                                            } else {
                                                closePage(index)
                                            }
                                        }} /> :
                                        <div style={{ width: '23px' }} />
                                    }
                                </div>
                            ))}
                            <div style={{ flexGrow: '1', borderBottom: 'solid 2px #efefef' }} />
                        </div>
                        <div style={{ flexGrow: '1' }}>
                            {pages[selectedPage].component()}
                        </div>
                    </div> :
                    <div className='project-pages' style={{ placeContent: 'center', alignItems: 'center' }}>
                        <div className='big-decorated-icon glow'>
                            <img src={add} />
                        </div>
                        <span style={{ marginTop: '10px' }}>Welcome to Beaver Architect</span>
                        <span style={{ fontSize: '14px', marginTop: '3px' }}>Start by opening something on the panel at your left</span>
                    </div>
                }
            </SplitPane>
        </ProjectContext.Provider >
    );
}

export default Project;