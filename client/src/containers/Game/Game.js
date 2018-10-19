import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import Goban from '../../components/Goban/Goban';
import axios from 'axios';

import { isGobanEqual, updateGoban } from '../../go_helpers';

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
                recentMove: pass ? [null, null] : [x, y],
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
                        recentMove={this.state.recentMove}
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
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{this.state.errorMessage}</span>}
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
            </div>
        );
    }
}

export default Game;
