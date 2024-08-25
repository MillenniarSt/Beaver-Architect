import React, { useEffect, useState } from 'react';
import { folder, file, reload, edit, remove, load } from '../../../icons';
import Tree from '../../../components/tree/Tree';
import TreeNode from '../../../components/tree/TreeNode';
import { ensureEditors, reloadEditors, getEditorIcon, getEditorPage } from '../page/file-editors/editors';
import { TextInputDialog, WarningDialog } from '../../dialog/dialogs';

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
            <div style={{ flexGrow: '1', margin: '10px 10px 0 0' }} >
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
            <TreeNode nodeId={entry.path} labelIcon={folder} labelText={entry.name} bgColor="#f3e8fd" contextMenuItems={[
                {
                    icon: folder, text: 'New Folder', onClick: () => TextInputDialog({
                        icon: folder,
                        title: 'New Folder',
                        message: 'Type the name of the new folder',
                        placeholder: 'Name',
                        callback: (name) => window.electron.createDir(entry.path + '\\' + name)
                    })
                },
                {
                    icon: file, text: 'New File', onClick: () => TextInputDialog({
                        icon: file,
                        title: 'New File',
                        message: 'Type the name of the new file',
                        placeholder: 'Name',
                        callback: (name) => window.electron.writeTextFile(entry.path + '\\' + name, '')
                    })
                },
                {
                    icon: edit, text: 'Rename', onClick: () => TextInputDialog({
                        icon: folder,
                        title: 'Rename Folder',
                        message: 'Type the new name of the folder',
                        placeholder: entry.name,
                        callback: (name) => window.electron.renameFile(entry.path, entry.path.substring(0, entry.path.lastIndexOf('\\') + 1) + name)
                    })
                },
                {
                    icon: remove, text: 'Delete', onClick: () => WarningDialog({
                        icon: remove,
                        color: '#ea1010',
                        title: 'Delete Folder',
                        message: 'Are you sure to delete permanently the folder?',
                        yes: () => window.electron.deleteFile(entry.path)
                    }),
                    color: '#db0c0c'
                }
            ]}>
                {entry.files.map((file) => buildTreeNode(file, addPage))}
            </TreeNode>
        );
    } else {
        const icon = getEditorIcon(entry.path);
        function open() {
            addPage({
                id: entry.path,
                icon: icon,
                name: entry.name,
                component: getEditorPage(entry.path)
            })
        }
        return (
            <TreeNode nodeId={entry.path} labelIcon={icon} labelText={entry.name} bgColor="#f3e8fd" onDoubleClick={open} contextMenuItems={[
                {
                    icon: load,
                    text: 'Open',
                    onClick: open
                },
                {
                    icon: load,
                    text: 'Open With',
                    onClick: () => { }
                },
                {
                    icon: edit,
                    text: 'Rename',
                    onClick: () => TextInputDialog({
                        icon: folder,
                        title: 'Rename File',
                        message: 'Type the new name of the file',
                        placeholder: entry.name,
                        callback: (name) => window.electron.renameFile(entry.path, entry.path.substring(0, entry.path.lastIndexOf('\\') + 1) + name)
                    })
                },
                {
                    icon: remove,
                    text: 'Delete',
                    onClick: () => WarningDialog({
                        icon: remove,
                        color: '#ea1010',
                        title: 'Delete File',
                        message: 'Are you sure to delete permanently the file?',
                        yes: () => window.electron.deleteFile(entry.path)
                    }),
                    color: '#db0c0c'
                }
            ]} />
        );
    }
}

export default FilesSidebar;