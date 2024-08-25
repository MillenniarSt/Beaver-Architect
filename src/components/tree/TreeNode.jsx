import { useState } from 'react';
import TreeItem from '@material-ui/lab/TreeItem';
import { makeStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import ContextMenu from '../context-menu/ContextMenu';

const useTreeItemStyles = makeStyles((theme) => ({
    root: {
        color: theme.palette.text.secondary,
        '&:hover > $content': {
            backgroundColor: '#005fdd4d'
        },
        '&:focus > $content, &$selected > $content': {
            backgroundColor: `#005fdd99`
        },
        '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
            backgroundColor: 'transparent',
        },
    },
    content: {
        color: 'var(--tree-view-color, #efefef)'
    },
    group: {
        marginLeft: 0,
        '& $content': {
            paddingLeft: theme.spacing(1.5),
        },
    },
    expanded: {},
    selected: {},
    label: {},
    labelRoot: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0.5, 0),
    },
    labelIcon: {
        marginRight: '5px',
        width: '22px',
        height: '22px'
    },
    labelText: {
        fontWeight: '500',
        flexGrow: 1,
        fontSize: '14px'
    },
}));

const initialContextMenu = {
    position: { x: 0, y: 0 },
    show: false
};

function TreeNode(props) {
    const classes = useTreeItemStyles();
    const { labelText, labelIcon, labelInfo, color, onDoubleClick, contextMenuItems, ...other } = props;

    const [contextMenu, setContextMenu] = useState(initialContextMenu);

    function handleContextMenu(e) {
        setContextMenu({
            position: { x: window?.innerWidth - e.clientX > 200 ? e.clientX : e.clientX - 200, y: e.clientY },
            show: true
        });
    }

    return (
        <>
            <TreeItem
                label={
                    <div className={classes.labelRoot} onDoubleClick={onDoubleClick} onContextMenu={(e) => {
                        if(contextMenuItems) {
                            handleContextMenu(e)
                        }
                    }}>
                        <img src={labelIcon} className={classes.labelIcon} />
                        <Typography variant="body2" className={classes.labelText}>
                            {labelText}
                        </Typography>
                        <Typography variant="caption" color="inherit">
                            {labelInfo}
                        </Typography>
                    </div>
                }
                style={{
                    '--tree-view-color': color
                }}
                classes={{
                    root: classes.root,
                    content: classes.content,
                    expanded: classes.expanded,
                    selected: classes.selected,
                    group: classes.group,
                    label: classes.label,
                }}
                {...other}
            />
            {contextMenu.show && <ContextMenu x={contextMenu.position.x} y={contextMenu.position.y} title={labelText} items={contextMenuItems} close={
                () => setContextMenu(initialContextMenu)
            } />}
        </>
    );
}

export default TreeNode;