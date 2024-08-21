import React from 'react';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { makeStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

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

function TreeNode(props) {
    const classes = useTreeItemStyles();
    const { labelText, labelIcon, labelInfo, color, onDoubleClick, ...other } = props;

    return (
        <TreeItem
            label={
                <div className={classes.labelRoot} onDoubleClick={onDoubleClick}>
                    <img src={labelIcon} className={classes.labelIcon}/>
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
    );
}

function Tree({ children }) {

    return (
        <TreeView style={{ flexGrow: '1' }} multiSelect
            defaultCollapseIcon={<ArrowDropDownIcon />}
            defaultExpandIcon={<ArrowRightIcon />}
            defaultEndIcon={<div style={{ width: 24 }} />}
        >
            {children}
        </TreeView>
    );
}

export { Tree, TreeNode };