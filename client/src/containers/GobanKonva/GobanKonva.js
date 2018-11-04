import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Stage, Layer, Rect, Circle,
} from 'react-konva';
import Sound from 'react-sound';

import GobanCells from './GobanCells/GobanCells';
import GobanCoordinates from './GobanCoordinates/GobanCoordinates';

import './GobanKonva.css';

import stoneSound1 from '../../assets/sounds/stone1.ogg';
import stoneSound2 from '../../assets/sounds/stone2.ogg';
import stoneSound3 from '../../assets/sounds/stone3.ogg';
import stoneSound4 from '../../assets/sounds/stone4.ogg';
import stoneSound5 from '../../assets/sounds/stone5.ogg';
import passSound from '../../assets/sounds/pass.ogg';

const stoneSounds = [
  stoneSound1,
  stoneSound2,
  stoneSound3,
  stoneSound4,
  stoneSound5,
];

const stars9 = [
  [2, 2],
  [2, 6],
  [4, 4],
  [6, 2],
  [6, 6],
];

const stars13 = [
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

const stars19 = [
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
    move: null, // eslint-disable-line react/no-unused-state
    size: null,
    stars: null,
    initialRender: true, // eslint-disable-line react/no-unused-state
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
      if (size === 9) stars = stars9;
      if (size === 13) stars = stars13;
      if (size === 19) stars = stars19;

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
        key={`${String(x)}_${String(y)}`}
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
            url={passSound}
            playStatus={Sound.status.PLAYING}
            volume={15}
          />
        );
      } else {
        // random stone sound
        sound = (
          <Sound
            url={stoneSounds[Math.floor(Math.random() * stoneSounds.length)]}
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
            height: '100%',
            width: '100%',
          }}
        >
          <Layer>
            <Rect
              preventDefault={false}
              x={0}
              y={0}
              width={this.state.width}
              height={this.state.height}
              fill="#dcb35c"
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

GobanKonva.propTypes = {
  recentMove: PropTypes.arrayOf(PropTypes.number).isRequired,
  showHover: PropTypes.bool.isRequired,
  onMove: PropTypes.func.isRequired,
  move: PropTypes.number.isRequired,
  stones: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  mute: PropTypes.bool,
};

GobanKonva.defaultProps = {
  mute: false,
};

export default GobanKonva;
