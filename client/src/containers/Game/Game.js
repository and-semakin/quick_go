import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import Goban from '../Goban/Goban';
import axios from 'axios';

import { isGobanEqual, updateGoban } from '../../go_helpers';

import './Game.css';

function TransitionUp(props) {
    return <Slide {...props} direction="up" />;
}


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
        recentMove: [null, null],
        errorMessage: 'Some error!',
        errorOpened: false,
        countPassesInARow: 0,
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
                let recentMove = [null, null];
                let countPassesInARow = 0;

                moves.forEach((move, index) => {
                    const {
                        order,
                        pass,
                        x, y
                    } = move;
                    const { goban: newGoban, captured, error } = updateGoban(goban, order, x, y, pass);
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
                    recentMove = pass ? [null, null] : [x, y];
                    if (pass) {
                        countPassesInARow++;
                    } else {
                        countPassesInARow = 0;
                    }
                });

                this.setState({
                    finished,
                    gobanSize,
                    isBlack,
                    capturedBlack,
                    capturedWhite,
                    move,
                    gobanHistory,
                    recentMove,
                    countPassesInARow
                })
            })
            .catch(error => {
                console.log(error);
            })

        const ws_scheme = (document.location.protocol === 'https:') ? 'wss' : 'ws';
        this.socket = new WebSocket(`${ws_scheme}://${document.location.host}/api/ws/${link}`);
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

        const { goban, captured, error } = updateGoban(
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
            let countPassesInARow = state.countPassesInARow;

            if (order % 2 === 0) {
                capturedBlack = capturedBlack + captured;
            } else {
                capturedWhite = capturedWhite + captured;
            }

            if (pass) {
                countPassesInARow++;
            } else {
                countPassesInARow = 0;
            }

            return {
                move: order + 1,
                gobanHistory: state.gobanHistory.concat([goban]),
                capturedBlack,
                capturedWhite,
                recentMove: pass ? [null, null] : [x, y],
                countPassesInARow,
            };
        });
    }

    snackbarCloseHandler = () => {
        this.setState({
            errorOpened: false,
        });
    }

    doMove = (x, y, pass = false) => {
        const move = this.state.move;
        if (move % 2 === Number(this.state.isBlack)) {
            console.log('Its not your turn!');
            return;
        }

        const { goban, error } = updateGoban(
            this.state.gobanHistory[move],
            move,
            x, y, pass
        );
        if (error) {
            this.setState({
                errorOpened: true,
                errorMessage: error,
            });
            console.log(error);
            return;
        }

        // ko rule
        if (!pass && move > 0 && isGobanEqual(goban, this.state.gobanHistory[move - 1])) {
            const ko_error = 'Ko rule violation detected!';
            this.setState({
                errorOpened: true,
                errorMessage: ko_error,
            });
            console.log(ko_error);
            return;
        }

        const msg = `${Number(move)} ${Number(x)} ${Number(y)} ${Number(pass)}`;
        console.log('->', msg);
        this.socket.send(msg);
    }

    render() {
        const next_move = (this.state.move % 2 === 0) ? 'black' : 'white'
        const next_move_you = (this.state.move % 2 !== Number(this.state.isBlack)) ? 'you' : 'your opponent'
        let goban = null;
        let actionButton = null;

        if (!this.state.finished) {
            if (this.state.countPassesInARow < 2) {
                actionButton = (
                    <div>
                        <Button
                            disabled={this.state.move % 2 === Number(this.state.isBlack)}
                            color="primary"
                            variant="contained"
                            onClick={() => this.doMove(null, null, true)}
                        >Pass</Button>
                    </div>
                );
            } else {
                actionButton = (
                    <div>
                        <Button
                            color="primary"
                            variant="contained"
                        >Finish Game</Button>
                    </div>
                );
            }
        }

        if (this.state.gobanSize > 0) {
            goban = (
                <>
                    <p>Move #{this.state.move + 1}, <b>{next_move}</b> goes ({next_move_you})</p>
                    <p>Black captured: {this.state.capturedBlack}</p>
                    <p>White captured: {this.state.capturedWhite}</p>
                    <Goban
                        showHover={Number(!this.state.isBlack) === this.state.move % 2}
                        recentMove={this.state.recentMove}
                        size={this.state.gobanSize}
                        stones={this.state.gobanHistory[this.state.move]}
                        move={this.state.move}
                        onMove={this.doMove}
                    />
                    {actionButton}
                </>
            );
        }

        return (
            <>
                <div className="Game">
                    {goban}
                </div>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">You can't go here: {this.state.errorMessage}</span>}
                    open={this.state.errorOpened}
                    autoHideDuration={2500}
                    onClose={this.snackbarCloseHandler}
                    TransitionComponent={TransitionUp}
                    action={
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            onClick={this.snackbarCloseHandler}
                        >
                            <CloseIcon />
                        </IconButton>
                    }
                />
            </>
        );
    }
}

export default Game;
