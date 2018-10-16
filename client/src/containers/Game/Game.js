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

        this.socket = new WebSocket(`ws://${document.location.host}/api/ws/${link}`)
        this.socket.addEventListener('open', () => {
            console.log('WebSocket connected.');
        });

        this.socket.addEventListener('message', this.onWebSockerMessageHandler)
    }

    onWebSockerMessageHandler = (event) => {
        console.log('<- ', event.data);
        let [order, x, y, pass] = event.data.split(" ");
        order = Number(order);
        x = Number(x);
        y = Number(y);
        pass = Boolean(Number(pass));
        
        const {goban, captured, error} = this.updateGoban(
            this.state.gobanHistory[this.state.move],
            this.state.move,
            x, y, pass
        );
        if (error) {
            console.log(error);
            return;
        }

        // ko rule
        if (!pass && this.state.move > 0 && isGobanEqual(goban, this.state.gobanHistory[this.state.move - 1])) {
            console.log('Ko rule violation detected!');
            return;
        }

        console.log(this.state.gobanHistory);
        console.log(goban);

        // update goban
        this.setState(state => {
            let capturedBlack = state.capturedBlack;
            let capturedWhite = state.capturedWhite;
            if (order % 2 === 0) {
                capturedBlack = capturedBlack + captured;
            } else {
                capturedWhite = capturedWhite + captured;
            }

            return {
                move: order + 1,
                gobanHistory: state.gobanHistory.concat([goban]),
                capturedBlack: capturedBlack,
                capturedWhite: capturedWhite,
            };
        });
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
        const move = this.state.move;
        if (move % 2 === Number(this.state.isBlack)) {
            console.log('Its not your turn!');
            return;
        }

        const {goban, error} = this.updateGoban(
            this.state.gobanHistory[move],
            move,
            x, y, pass
        );
        if (error) {
            console.log(error);
            return;
        }

        // ko rule
        if (!pass && move > 0 && isGobanEqual(goban, this.state.gobanHistory[move - 1])) {
            console.log('Ko rule violation detected!');
            return;
        }

        const msg = `${Number(move)} ${Number(x)} ${Number(y)} ${Number(pass)}`;
        console.log('->', msg);
        this.socket.send(msg);
    }

    render() {
        const next_move = (this.state.move % 2 === 0) ? 'черные' : 'белые'
        const next_move_you = (this.state.move % 2 !== Number(this.state.isBlack)) ? 'ты' : 'не ты'
        let goban = null;
        if (this.state.gobanSize > 0) {
            goban = (
                <>
                    <p>Ход №{this.state.move}, ходят {next_move} ({next_move_you})</p>
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
