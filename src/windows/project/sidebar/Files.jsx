import React, { useEffect, useState } from 'react';
import { folder, reload } from '../../../icons';
import { Tree, TreeNode } from '../../../components/tree/Tree';
import { ensureEditors, reloadEditors, getEditorIcon, getEditorPage } from '../page/file-editors/editors';

function FilesSidebar({ title, dir, addPage }) {

    const [tree, setTree] = useState();

    useEffect(() => {
        ensureEditors(() => window.electron.getTreeFiles(dir).then((tree) => setTree(tree)));
    }, []);

    if (tree === undefined) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flexGrow: '1', fontWeight: '600', fontSize: '24px' }}>{title}</span>
                    <img src={reload} className='small-icon-button' onClick={() => {
                        setTree(undefined);
                        reloadEditors(() => window.electron.getTreeFiles(dir).then((tree) => setTree(tree)));
                    }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ flexGrow: '1', fontWeight: '600', fontSize: '24px' }}>{title}</span>
                <img src={reload} className='small-icon-button' onClick={() => {
                    setTree(undefined);
                    reloadEditors(() => window.electron.getTreeFiles(dir).then((tree) => setTree(tree)));
                }} />
            </div>
            <div style={{ flexGrow: '1', margin: '10px 10px 0 0' }}>
                <Tree>
                    {tree.map((entry) => buildTreeNode(entry, addPage))}
                </Tree>
            </div>
        </div>
    );
}

function buildTreeNode(entry, addPage) {
    if (entry.files !== undefined) {
        return (
            <TreeNode nodeId={entry.path} labelIcon={folder} labelText={entry.name} bgColor="#f3e8fd">
                {entry.files.map((file) => buildTreeNode(file, addPage))}
            </TreeNode>
        );
    } else {
        const icon = getEditorIcon(entry.path);
        return (
            <TreeNode nodeId={entry.path} labelIcon={icon} labelText={entry.name} bgColor="#f3e8fd" onDoubleClick={() => {
                addPage({
                    id: entry.path,
                    icon: icon,
                    name: entry.name,
                    component: getEditorPage(entry.path)
                })
            }} />
        );
    }
}

export default FilesSidebar;