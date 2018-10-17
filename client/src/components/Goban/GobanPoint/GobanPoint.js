import React from 'react';

import './GobanPoint.css';
import GobanStone from '../GobanStone/GobanStone';

const GobanPoint = (props) => {
    let classes = ['goban-point'];

    if (props.row === 0) {
        classes.push('goban-point-top-row');
    }
    if (props.row === props.size - 1) {
        classes.push('goban-point-bottom-row');
    }
    if (props.column === 0) {
        classes.push('goban-point-left-column');
    }
    if (props.column === props.size - 1) {
        classes.push('goban-point-right-column');
    }

    let stone = null;
    let star = null;

    if (props.showHover) {
        stone = (
            <div
                className={[
                    "goban-point-emptiness",
                    (props.move % 2 === 0) ? 'empty-black' : 'empty-white'
                ].join(' ')}
            />
        );
    }

    if (props.stone) {
        stone = <GobanStone color={props.stone} recent={props.recent} />
    }

    if (props.star) {
        star = <div className="star" />;
    }

    return (
        <div className={classes.join(' ')} onClick={props.onClick}>
            {stone}
            {star}
        </div>
    );
};

export default GobanPoint;