import React from 'react';

import './GobanStone.css';

const GobanStone = (props) => {
    let recent = null;
    if (props.recent) {
        recent = <div className="recent"/>;
    }
    return (
        <div className={"goban-stone " + props.color}>
            {recent}
        </div>
    );
};

export default GobanStone;