import React, { Component } from 'react';

import Goban from '../../components/Goban/Goban';

class Game extends Component {
    state = {
        move: 0,
        gobanSize: 9,
        capturedWhite: 0,
        capturedBlack: 0,
        goban: [],
    }

    componentWillMount() {
        this.setState({
            goban: [...Array(this.state.gobanSize)].map(e => Array(this.state.gobanSize))
        })
    }

    doMove = (x, y) => {
        if (this.state.goban[x][y] !== undefined) return;

        this.setState(state => {
            const newGoban = [...state.goban]
            const newGobanRow = [...state.goban[x]]
            newGobanRow[y] = state.move;
            newGoban[x] = newGobanRow;

            return {
                move: state.move + 1,
                goban: newGoban,
            };
        });
    }
    
    render() {
        const next_move = <p>{(this.state.move % 2 === 0) ? 'Ход черных' : 'Ход белых'}</p>

        return (
            <div>
                <h1>Go Game</h1>
                {next_move}
                <Goban
                    isBlackTurn={this.props.isBlackTurn}
                    size={this.state.gobanSize}
                    onMove={this.doMove}
                    stones={this.state.goban}
                    move={this.state.move} />
            </div>
        );
    }
}

export default Game;
