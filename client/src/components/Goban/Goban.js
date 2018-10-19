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
import pass_sound from './sounds/pass.ogg';

const stone_sounds = [
    stone_sound1,
    stone_sound2,
    stone_sound3,
    stone_sound4,
    stone_sound5
];

const stars_9 = [
    [2, 2],
    [2, 6],
    [4, 4],
    [6, 2],
    [6, 6],
];

const stars_13 = [
    [3, 3],
    [3, 6],
    [3, 9],
    [6, 3],
    [6, 6],
    [6, 9],
    [9, 3],
    [9, 6],
    [9, 9],
];

const stars_19 = [
    [3, 3],
    [3, 9],
    [3, 15],
    [9, 3],
    [9, 9],
    [9, 15],
    [15, 3],
    [15, 9],
    [15, 15],
];

class Goban extends Component {
    state = {
        initialRender: true,
        size: null,
        stars: [],
    }

    componentDidUpdate() {
        if (!this.state.initialRender) return;
        this.setState({
            initialRender: false,
        });
    }

    static getDerivedStateFromProps(props, state) {
        if (props.size === state.size) {
            return null;
        }

        let stars = [];
        if (props.size === 9) stars = stars_9;
        if (props.size === 13) stars = stars_13;
        if (props.size === 19) stars = stars_19;

        return {
            size: props.size,
            stars: stars,
        };
    }

    drawGoban = () => {
        const gobanRows = [];

        for (let x = 0; x < this.state.size; x++) {
            let rowPoints = [];

            for (let y = 0; y < this.state.size; y++) {
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
                        size={this.state.size}
                        row={x}
                        column={y}
                        stone={stone}
                        move={this.props.move}
                        star={this.state.stars.some(s => s[0] === x && s[1] === y)}
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

        console.log('init', this.state.initialRender);

        if (!this.state.initialRender) {
            if (this.props.recentMove[0] === null) {
                // pass sound
                sound = (
                    <Sound
                        url={pass_sound}
                        playStatus={Sound.status.PLAYING}
                        volume={15}
                    />
                );
            } else {
                // random stone sound
                sound = (
                    <Sound
                        url={stone_sounds[Math.floor(Math.random() * stone_sounds.length)]}
                        playStatus={Sound.status.PLAYING}
                        volume={15}
                    />
                );
            }
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