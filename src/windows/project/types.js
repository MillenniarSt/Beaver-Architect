import FilesSidebar from './sidebar/Files';
import { files } from '../../icons';
import { dataPacksDir } from '../../data';

/**
 * Define the base properties for every Project type
 * Other properties can be added by plugins based on the architect
 */
const types = {
    world: {},

    structure: {},

    terrain: {},

    data_pack: {
        sidebar: [
            {
                icon: files,
                component: (project, addPage) => <FilesSidebar title='Files' dir={`${dataPacksDir}\\${project.architect}\\${project.builder.identifier}`} addPage={addPage} />
            }
        ]
    }
}

export default types;