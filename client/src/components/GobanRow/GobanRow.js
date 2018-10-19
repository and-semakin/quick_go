import React from 'react';

import './GobanRow.css';

const GobanRow = (props) => {
    return (
        <div className="goban-row">
            {props.children}
        </div>
    );
};

export default GobanRow;