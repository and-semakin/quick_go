import React, { Component } from 'react';
import { Stage, Layer, Rect, Circle } from 'react-konva';
import Sound from 'react-sound';

import GobanCells from './GobanCells/GobanCells';
import GobanCoordinates from './GobanCoordinates/GobanCoordinates';

import './GobanKonva.css';

import stone_sound1 from '../../assets/sounds/stone1.ogg';
import stone_sound2 from '../../assets/sounds/stone2.ogg';
import stone_sound3 from '../../assets/sounds/stone3.ogg';
import stone_sound4 from '../../assets/sounds/stone4.ogg';
import stone_sound5 from '../../assets/sounds/stone5.ogg';
import pass_sound from '../../assets/sounds/pass.ogg';

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

class GobanKonva extends Component {
    state = {
        move: null,
        size: null,
        stars: null,
        initialRender: true,
        playSounds: false,
        cellSize: null,
        borderSize: null,
        width: null,
        height: null,
    }

    static getDerivedStateFromProps(props, state) {
        let {
            move,
            size,
            stars,
            playSounds,
            cellSize,
            borderSize,
            width,
            height,
        } = state;
        playSounds = false;

        if (props.move !== move) {
            move = props.move;
            playSounds = !state.initialRender;
        }

        if (props.size !== size) {
            size = props.size;
            if (size === 9) stars = stars_9;
            if (size === 13) stars = stars_13;
            if (size === 19) stars = stars_19;

            cellSize = (size > 13) ? 30 : 40;
            borderSize = (size > 13) ? 18 : 20;
            width = (cellSize * size) + (borderSize * 2);
            height = width;
        }

        return {
            move,
            size,
            stars,
            cellSize,
            borderSize,
            width,
            height,
            initialRender: false,
            playSounds,
        };
    }

    render() {
        const drawnStars = this.state.stars.map(([x, y]) => (
            <Circle
                key={String(x) + "_" + String(y)}
                preventDefault={false}
                fill="black"
                radius={4}
                x={this.state.borderSize + (this.state.cellSize * x) + (this.state.cellSize / 2) + 0.5}
                y={this.state.borderSize + (this.state.cellSize * y) + (this.state.cellSize / 2) + 0.5}
            />
        ));

        let sound = null;

        if (!this.props.mute && this.state.playSounds) {
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
            <>
                <Stage
                    width={this.state.width}
                    height={this.state.height}
                    preventDefault={false}
                    style={{
                        height: "100%",
                        width: "100%",
                    }}
                >
                    <Layer>
                        <Rect
                            preventDefault={false}
                            x={0}
                            y={0}
                            width={this.state.width}
                            height={this.state.height}
                            fill="#d58220"
                        />
                        {drawnStars}
                        <GobanCoordinates
                            size={this.state.size}
                            cellSize={this.state.cellSize}
                            borderSize={this.state.borderSize}
                        />
                        <GobanCells
                            preventDefault={false}
                            showHover={this.props.showHover}
                            isHoverBlack={this.props.move % 2 === 0}
                            onMove={this.props.onMove}
                            stones={this.props.stones}
                            recentMove={this.props.recentMove}
                            x={this.state.borderSize}
                            y={this.state.borderSize}
                            size={this.state.size}
                            cellSize={this.state.cellSize}
                        />
                    </Layer>
                </Stage>
                {sound}
            </>
        );
    }
}

export default GobanKonva;