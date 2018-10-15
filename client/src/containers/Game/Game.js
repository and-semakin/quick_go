import React, { Component } from 'react';
import Button from '@material-ui/core/Button';

import Goban from '../../components/Goban/Goban';
import axios from 'axios';

import { xy2n, findGroup, captureGroup, findLiberties, isGobanEqual } from '../../go_helpers';

class Game extends Component {
    state = {
        isBlack: undefined,
        move: 0,
        link: undefined,
        finished: undefined,
        capturedWhite: 0,
        capturedBlack: 0,
        gobanSize: 0,
        gobanHistory: [[]],
    }

    componentDidMount() {
        console.log('Requesting game info...');
        const link = this.props.match.params.link;
        axios.get(`/api/game/${link}`)
            .then(response => {
                console.log(response);
                const {
                    finished,
                    gobanSize,
                    isBlack,
                    move,
                    moves
                } = response.data;

                const gobanHistory = [[...Array(gobanSize)].map(e => Array(gobanSize))];
                let goban = gobanHistory[0];
                let capturedBlack = 0;
                let capturedWhite = 0;

                console.log(-1, gobanHistory);

                moves.forEach((move, index) => {
                    console.log(index, gobanHistory);

                    const {
                        order,
                        pass,
                        x, y
                    } = move;
                    const {goban: newGoban, captured, error} = this.updateGoban(goban, order, x, y, pass);
                    if (error) {
                        console.log(error);
                    }
                    if (index % 2 === 0) {
                        capturedBlack = capturedBlack + captured;
                    } else {
                        capturedWhite = capturedWhite + captured;
                    }
                    gobanHistory.push(newGoban);
                    goban = newGoban;
                });

                this.setState({
                    finished,
                    gobanSize,
                    isBlack,
                    capturedBlack,
                    capturedWhite,
                    move,
                    gobanHistory,
                })
            })
            .catch(error => {
                console.log(error);
            })
    }

    updateGoban = (sourceGoban, move, x, y, pass) => {
        const gobanSize = sourceGoban.length;

        // deep copy of current goban state
        const goban = sourceGoban.map(gobanRow => gobanRow.slice());

        // pass
        if (pass) {
            return {goban: goban, captured: 0};
        }

        // the place is taken
        if (goban[x][y] !== undefined) {
            return {goban: undefined, captured: undefined, error: 'The place is taken'};
        }

        goban[x][y] = move;

        let captured = 0;

        const updatedGroup = findGroup(goban, xy2n(x, y, gobanSize));

        for (let i = 0; i < gobanSize; i++) {
            for (let j = 0; j < gobanSize; j++) {
                const n = xy2n(i, j, gobanSize);
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

        const isSuicideMove = findLiberties(goban, xy2n(x, y, gobanSize)).size === 0;
        if (isSuicideMove) {
            return { goban: false, captured: 0, error: 'Suicide detected!'};
        }

        return { goban: goban, captured: captured, error: undefined };
    };

    doMove = (x, y, pass = false) => {
        const goban = this.state.gobanHistory[this.state.move]

        // kill all the other stones around if needed
        const { goban: newGoban, captured, error } = this.updateGoban(goban, this.state.move, x, y, pass);

        if (error) {
            console.log(error);
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
        let goban = null;
        if (this.state.gobanSize > 0) {
            goban = (
                <>
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
                </>
            );
        }

        return (
            <div>
                {goban}
            </div>
        );
    }
}

export default Game;
