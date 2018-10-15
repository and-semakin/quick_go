import React, { Component } from 'react';

import GobanRow from './GobanRow/GobanRow';
import GobanPoint from './GobanPoint/GobanPoint';

import './Goban.css';

class Goban extends Component {
    state = {};

    // static getDerivedStateFromProps(props, state) {
    //     console.log('[Goban Update]', props);
    //     return state;
    // }

    drawGoban = () => {
        const gobanRows = [];

        for (let x = 0; x < this.props.size; x++) {
            let rowPoints = [];

            for (let y = 0; y < this.props.size; y++) {
                let stone = null;
                if (this.props.stones[x][y] !== undefined) {
                    stone = (this.props.stones[x][y] % 2 === 0) ? 'black' : 'white';
                }

                rowPoints.push(
                    <GobanPoint
                        onClick={() => this.props.onMove(x, y)}
                        key={String(x) + '_' + String(y)}
                        size={this.props.size}
                        row={x}
                        column={y}
                        stone={stone}
                        move={this.props.move}
                    />
                );
            }

            gobanRows.push(<GobanRow key={x}>{rowPoints}</GobanRow>);
        }

        return gobanRows;
    }

    render() {
        const goban = this.drawGoban();

        return (
            <div className="goban">
                {goban}
            </div>
        );
    }
}

export default Goban;