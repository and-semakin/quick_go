import React, { Component } from 'react';
import { Group, Line, Circle, Rect } from 'react-konva';

class GobanCell extends Component {
    state = {
        hovered: false,
    }

    onMouseOver = () => {
        if (this.props.stone === undefined && this.props.showHover) {
            this.setState({ hovered: true });
        }
    }

    onMouseLeave = () => {
        if (this.props.stone === undefined && this.props.showHover) {
            this.setState({ hovered: false });
        }
    }

    onClick = () => {
        this.setState({ hovered: false });
        this.props.onClick();
    }

    render() {
        const size = this.props.size;

        let hover = null;
        let stone = null;
        let recentMark = null;

        if (this.state.hovered) {
            hover = (
                <Circle
                    preventDefault={false}
                    fill={(this.props.isHoverBlack) ? "black" : "white"}
                    opacity={0.5}
                    x={(size / 2) + 0.5}
                    y={(size / 2) + 0.5}
                    radius={(size / 2)}
                />
            );
        }

        if (this.props.stone !== undefined) {
            stone = (
                <Circle
                    preventDefault={false}
                    fill={(this.props.stone % 2 === 0) ? "black" : "white"}
                    x={(size / 2) + 0.5}
                    y={(size / 2) + 0.5}
                    radius={(size / 2)}
                />
            );

            if (this.props.isRecent) {
                recentMark = (
                    <Circle
                        preventDefault={false}
                        stroke={(this.props.stone % 2 !== 0) ? "black" : "white"}
                        strokeWidth={1.5}
                        x={(size / 2) + 0.5}
                        y={(size / 2) + 0.5}
                        radius={(size / 2) * 0.6}
                    />
                );
            }
        }

        return (
            <Group
                preventDefault={false}
                x={this.props.x} y={this.props.y}
                height={size} width={size}
                onMouseEnter={this.onMouseOver}
                onMouseLeave={this.onMouseLeave}
                onClick={this.onClick}
            >
                {/* for hover */}
                <Rect
                    preventDefault={false}
                    x={0} y={0}
                    height={size} width={size}
                />
                {/* vertical */}
                <Line
                    preventDefault={false}
                    points={[
                        (size / 2) + 0.5,
                        (this.props.isTop) ? (size / 2) + 0.5 : 0.5,
                        (size / 2) + 0.5,
                        // +1 чтобы не было зазора в полпикселя на стыке
                        (this.props.isBottom) ? (size / 2) + 0.5 : size + 1
                    ]}
                    stroke='black'
                    strokeWidth={1}
                />
                {/* horizontal */}
                <Line
                    preventDefault={false}
                    points={[
                        (this.props.isLeft) ? (size / 2) + 0.5 : 0.5,
                        (size / 2) + 0.5,
                        // +1 чтобы не было зазора в полпикселя на стыке
                        (this.props.isRight) ? (size / 2) + 0.5 : size + 1,
                        (size / 2) + 0.5
                    ]}
                    stroke='black'
                    strokeWidth={1}
                />
                {hover}
                {stone}
                {recentMark}
            </Group>
        )
    }
}

export default GobanCell;