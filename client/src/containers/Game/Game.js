import React, { Component } from 'react';
import Button from '@material-ui/core/Button';

import Goban from '../../components/Goban/Goban';
import axios from 'axios';

import { isGobanEqual, updateGoban } from '../../go_helpers';

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

                moves.forEach((move, index) => {
                    const {
                        order,
                        pass,
                        x, y
                    } = move;
                    const {goban: newGoban, captured, error} = updateGoban(goban, order, x, y, pass);
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
        
        const {goban, captured, error} = updateGoban(
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

    doMove = (x, y, pass = false) => {
        const move = this.state.move;
        if (move % 2 === Number(this.state.isBlack)) {
            console.log('Its not your turn!');
            return;
        }

        const {goban, error} = updateGoban(
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
                        showHover={Number(!this.state.isBlack) === this.state.move % 2}
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
