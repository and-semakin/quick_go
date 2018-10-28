import React from 'react';
import { Group } from 'react-konva';

import GobanCell from '../GobanCell/GobanCell';

const gobanCells = (props) => {
    const gobanCells = [];
    const size = props.size;
    const border = size - 1;
    const cellSize = props.cellSize; // px
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            gobanCells.push(
                <GobanCell
                    key={String(i) + ';' + String(j)}
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
                />
            );
        }
    }
    return (
        <Group x={props.x} y={props.y}>
            {gobanCells}
        </Group>
    );
}

export default gobanCells;