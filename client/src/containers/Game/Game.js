import React, { Component } from 'react';
import Button from '@material-ui/core/Button';

import Goban from '../../components/Goban/Goban';

import { xy2n, findGroup, captureGroup, findLiberties, isGobanEqual } from '../../go_helpers';

class Game extends Component {
    state = {
        move: 0,
        capturedWhite: 0,
        capturedBlack: 0,
        gobanSize: 9,
        gobanHistory: [],
    }

    componentWillMount() {
        this.setState({
            gobanHistory: [[...Array(this.state.gobanSize)].map(e => Array(this.state.gobanSize))],
        })
    }

    updateGoban = (goban, x, y) => {
        goban[x][y] = this.state.move;

        let captured = 0;

        const updatedGroup = findGroup(goban, xy2n(x, y, this.state.gobanSize));

        for (let i = 0; i < this.state.gobanSize; i++) {
            for (let j = 0; j < this.state.gobanSize; j++) {
                const n = xy2n(i, j, this.state.gobanSize);
                if (goban[i][j] === undefined || 
                    updatedGroup.includes(n)) {
                    continue;
                }
                const hasLiberties = findLiberties(goban, n).size > 0;
                if (!hasLiberties) {
                    const capturedCount = captureGroup(goban, n);
                    captured += capturedCount;
                }
            }
        }

        const isSuicideMove = findLiberties(goban, xy2n(x, y, this.state.gobanSize)).size === 0;
        if (isSuicideMove) {
            return {goban: false, captured: 0};
        }

        return {goban: goban, captured: captured};
    };

    doMove = (x, y, pass = false) => {
        // deep copy of current goban state
        const goban = this.state.gobanHistory[this.state.move].map(gobanRow => gobanRow.slice());

        // pass
        if (pass) {
            this.setState(state => {
                return {
                    move: state.move + 1,
                    gobanHistory: state.gobanHistory.concat([goban]),
                }
            });
            return;
        }

        // the place is taken
        if (goban[x][y] !== undefined) return;

        // kill all the other stones around if needed
        const {goban: newGoban, captured} = this.updateGoban(goban, x, y);

        if (newGoban === false) {
            console.log('Suicide detected!');
            return;
        }

        // ko rule
        if (this.state.move > 0 && isGobanEqual(newGoban, this.state.gobanHistory[this.state.move - 1])) {
            console.log('Ko rule violation detected!');
            return;
        }

        // update goban
        this.setState(state => {
            let capturedBlack = state.capturedBlack;
            let capturedWhite = state.capturedWhite;
            if (state.move % 2 === 0) {
                capturedBlack = state.capturedBlack + captured;
            } else {
                capturedWhite = state.capturedWhite + captured;
            }

            return {
                move: state.move + 1,
                gobanHistory: state.gobanHistory.concat([newGoban]),
                capturedBlack: capturedBlack,
                capturedWhite: capturedWhite,
            };
        });
    }
    
    render() {
        const next_move = (this.state.move % 2 === 0) ? 'черные' : 'белые'

        return (
            <div>
                <p>Ход №{this.state.move}, ходят {next_move}</p>
                <p>В плену у черных: {this.state.capturedBlack}</p>
                <p>В плену у белых: {this.state.capturedWhite}</p>
                <Goban
                    size={this.state.gobanSize}
                    stones={this.state.gobanHistory[this.state.move]}
                    move={this.state.move}
                    onMove={this.doMove}
                />
                <div>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => this.doMove(null, null, true)}
                    >Пас</Button>
                </div>
            </div>
        );
    }
}

export default Game;
