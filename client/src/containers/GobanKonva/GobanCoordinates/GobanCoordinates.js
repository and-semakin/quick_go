import React from 'react';
import { Text } from 'react-konva';

const coordinates = [
  'A', 'B', 'C', 'D', 'E',
  'F', 'G', 'H', 'J', 'K',
  'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U',
  'V', 'W', 'X', 'Y', 'Z',
];

const gobanCoordinates = (props) => {
  const letters = [];

  for (let i = 0; i < props.size; i++) {
    letters.push(
      <Text
        key={`left_${i}`}
        text={String(i + 1)}
        fontFamily="sans-serif"
        fontSize={10}
        align="center"
        verticalAlign="middle"
        x={0}
        y={props.borderSize + (props.cellSize * (props.size - 1 - i))}
        width={props.borderSize}
        height={props.cellSize}
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
        x={props.borderSize + (props.cellSize) * props.size}
        y={props.borderSize + (props.cellSize * (props.size - 1 - i))}
        width={props.borderSize}
        height={props.cellSize}
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
        x={props.borderSize + (props.cellSize * i)}
        y={0}
        width={props.cellSize}
        height={props.borderSize}
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
        x={props.borderSize + (props.cellSize * i)}
        y={props.borderSize + (props.cellSize) * props.size}
        width={props.cellSize}
        height={props.borderSize}
      />,
    );
  }

  return (
        <>
          {letters}
        </>
  );
};

export default gobanCoordinates;
