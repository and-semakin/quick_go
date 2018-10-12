import React from 'react';

import './GobanStone.css';

const GobanStone = (props) => {
    return (
        <div className={"goban-stone " + props.color}></div>
    );
};

export default GobanStone;