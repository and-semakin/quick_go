import React from 'react';
import PropTypes from 'prop-types';
import { Group } from 'react-konva';

import GobanCell from '../GobanCell/GobanCell';

const gobanCells = (props) => {
  const cells = [];
  const size = props.size;
  const border = size - 1;
  const cellSize = props.cellSize; // px
  for (let i = 0; i < size; i += 1) {
    for (let j = 0; j < size; j += 1) {
      cells.push(
        <GobanCell
          key={`${String(i)};${String(j)}`}
          preventDefault={false}
          size={cellSize}
          x={cellSize * i}
          y={cellSize * j}
          isTop={j === 0}
          isBottom={j === border}
          isLeft={i === 0}
          isRight={i === border}
          showHover={props.showHover}
          isHoverBlack={props.isHoverBlack}
          stone={props.stones[j][i]}
          isRecent={props.recentMove[0] === j && props.recentMove[1] === i}
          onClick={() => props.onMove(j, i)}
        />,
      );
    }
  }
  return (
    <Group x={props.x} y={props.y}>
      {cells}
    </Group>
  );
};

gobanCells.propTypes = {
  size: PropTypes.number.isRequired,
  cellSize: PropTypes.number.isRequired,
  onMove: PropTypes.func.isRequired,
  showHover: PropTypes.bool.isRequired,
  isHoverBlack: PropTypes.bool.isRequired,
  stones: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  recentMove: PropTypes.arrayOf(PropTypes.number).isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
};

export default gobanCells;
