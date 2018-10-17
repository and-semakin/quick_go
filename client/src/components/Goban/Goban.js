import React, { Component } from 'react';
import Sound from 'react-sound';

import GobanRow from './GobanRow/GobanRow';
import GobanPoint from './GobanPoint/GobanPoint';

import './Goban.css';

import stone_sound1 from './sounds/stone1.ogg';
import stone_sound2 from './sounds/stone2.ogg';
import stone_sound3 from './sounds/stone3.ogg';
import stone_sound4 from './sounds/stone4.ogg';
import stone_sound5 from './sounds/stone5.ogg';

const stone_sounds = [
    stone_sound1,
    stone_sound2,
    stone_sound3,
    stone_sound4,
    stone_sound5
];

class Goban extends Component {
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
                        recent={(this.props.recentMove[0] === x && this.props.recentMove[1] === y)}
                        showHover={this.props.showHover}
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
        let sound = null;

        if (this.props.playStoneCluck) {
            sound = (
                <Sound
                    url={stone_sounds[Math.floor(Math.random() * stone_sounds.length)]}
                    playStatus={Sound.status.PLAYING}
                    volume={15}
                />
            );
        }

        return (
            <div className="goban">
                {goban}
                {sound}
            </div>
        );
    }
}

export default Goban;