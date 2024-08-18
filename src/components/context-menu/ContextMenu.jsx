import './ContextMenu.css';
import { useClickAway } from '@uidotdev/usehooks';

function ContextMenu({ x, y, title, items, close }) {

    const ref = useClickAway(close);

    return (
        <div ref={ref} style={{top: `${y}px`, left: `${x}px`}} className={'context-menu'}>
            <span className='context-menu-title'>{title}</span>
            {items.map((item, index) => (
                <button key={index} onClick={(e) => {
                    close();
                    item.onClick();
                }}>
                    {item.icon !== undefined && <img src={item.icon} className='icon'/>}
                    <span style={{color: item.color ?? '#efefef'}}>{item.text}</span>
                </button>
            ))}
        </div>
    );
}

export default ContextMenu;