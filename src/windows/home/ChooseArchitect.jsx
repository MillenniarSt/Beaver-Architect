import './ChooseArchitect.css';
import { world, structure, dataPack } from '../../icons';

//TODO Sincronize with backend
let architects = [{icon: world, id: 'minecraft', name: "Minecraft"}, {icon: world, id: 'the_sandbox', name: "The SandBox"}];

function ChooseArchitect({ close }) {

    return (
        <div className={'choose-architect'}>
            <span style={{fontSize: '18px', fontWeight: 'bold', textAlign: 'center'}}>Select an Architect</span>
            <div style={{flexGrow: 1, display: 'flex', gap: '10px', flexDirection: 'column', overflow: 'auto'}}>
                {architects.map((architect, index) => (
                    <div key={index} className='architect-label'>
                        <img src={architect.icon} className='architect-icon'/>
                        <div style={{flexGrow: '1'}}>
                            <span className='architect-name'>{architect.name}</span>
                            <div style={{display: 'flex', gap: '10px', paddingRight: '15px'}}>
                                <div className='glow-hover architect-builder' onClick={() => {
                                    close();
                                    window.electron.openEditProject({project: createNewProject(architect.id, 'world')});
                                }}>
                                    <img src={world}/>
                                    <span>World</span>
                                </div>
                                <div className='glow-hover architect-builder' onClick={() => {
                                    close();
                                    window.electron.openEditProject({project: createNewProject(architect.id, 'structure')});
                                }}>
                                    <img src={structure}/>
                                    <span>Structure</span>
                                </div>
                                <div className='glow-hover architect-builder' onClick={() => {
                                    close();
                                    window.electron.openEditProject({project: createNewProject(architect.id, 'data_pack')});
                                }}>
                                    <img src={dataPack}/>
                                    <span>Data Pack</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button style={{margin: '15px 10px 5px 10px'}} className='glow-hover' onClick={() => close()}>Cancel</button>
        </div>
    );
}

function createNewProject(architect, type) {
    return {
        architect,
        type,
        name: '',
        description: '',
        info: ''
    };
}

export default ChooseArchitect;