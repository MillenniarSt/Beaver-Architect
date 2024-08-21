import { useContext, useState } from 'react';
import './Sidebar.css';
import { ProjectContext } from '../../../stores/contexts';

function Sidebar({ bars, show, setShow, addPage }) {

    const { project } = useContext(ProjectContext);
    const [selected, select] = useState(0);

    return (
        <div className='sidebar'>
            <div className='sidebar-icon-region'>
                {bars.map((bar, index) => {
                    if(bar.divider === true) {
                        return <hr key={index}/>;
                    }

                    return <img key={index} src={bar.icon} className={selected === index ? 'icon-selected' : 'icon-unselected'} onClick={() => {
                        if(selected === index) {
                            setShow(!show)
                        } else {
                            select(index)
                        }
                    }}/>;
                })}
            </div>
            <div className='sidebar-content'>
                {bars[selected].component(project, addPage)}
            </div>
        </div>
    );
}

export default Sidebar;