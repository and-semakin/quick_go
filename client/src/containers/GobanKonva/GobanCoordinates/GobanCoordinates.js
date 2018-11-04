import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-konva';

const coordinates = [
  'A', 'B', 'C', 'D', 'E',
  'F', 'G', 'H', 'J', 'K',
  'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U',
  'V', 'W', 'X', 'Y', 'Z',
];

const gobanCoordinates = ({
  size,
  borderSize,
  cellSize,
}) => {
  const letters = [];

  for (let i = 0; i < size; i += 1) {
    letters.push(
      <Text
        key={`left_${i}`}
        text={String(i + 1)}
        fontFamily="sans-serif"
        fontSize={10}
        align="center"
        verticalAlign="middle"
        x={0}
        y={borderSize + (cellSize * (size - 1 - i))}
        width={borderSize}
        height={cellSize}
      />,
    );
    letters.push(
      <Text
        key={`right_${i}`}
        text={String(i + 1)}
        fontFamily="sans-serif"
        fontSize={10}
        align="center"
        verticalAlign="middle"
        x={borderSize + (cellSize) * size}
        y={borderSize + (cellSize * (size - 1 - i))}
        width={borderSize}
        height={cellSize}
      />,
    );
    letters.push(
      <Text
        key={`top_${i}`}
        text={coordinates[i]}
        fontFamily="sans-serif"
        fontSize={10}
        align="center"
        verticalAlign="middle"
        x={borderSize + (cellSize * i)}
        y={0}
        width={cellSize}
        height={borderSize}
      />,
    );
    letters.push(
      <Text
        key={`bottom_${i}`}
        text={coordinates[i]}
        fontFamily="sans-serif"
        fontSize={10}
        align="center"
        verticalAlign="middle"
        x={borderSize + (cellSize * i)}
        y={borderSize + (cellSize) * size}
        width={cellSize}
        height={borderSize}
      />,
    );
  }

  return (
    <>
      {letters}
    </>
  );
};

gobanCoordinates.propTypes = {
  size: PropTypes.number.isRequired,
  borderSize: PropTypes.number.isRequired,
  cellSize: PropTypes.number.isRequired,
};

export default gobanCoordinates;
