import React, { Component } from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';
import axios from 'axios';

import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';

import GobanKonva from '../GobanKonva/GobanKonva';
import { isGobanEqual, updateGoban } from '../../go_helpers';
import './Game.css';

function TransitionUp(props) {
  return <Slide {...props} direction="up" />;
}


class Game extends Component {
  state = {
    isBlack: undefined,
    move: 0,
    link: undefined, // eslint-disable-line react/no-unused-state
    finished: undefined,
    result: undefined,
    startDate: undefined, // eslint-disable-line react/no-unused-state
    finishDate: undefined, // eslint-disable-line react/no-unused-state
    capturedWhite: 0,
    capturedBlack: 0,
    gobanSize: 0,
    gobanHistory: [[]],
    recentMove: [null, null],
    errorMessage: 'Some error!',
    errorOpened: false,
    countPassesInARow: 0,
    resignDialogOpened: false,
    mute: false,
    moveSubmitEnabled: undefined,
    undoRequestsEnabled: undefined, // eslint-disable-line react/no-unused-state
    chatEnabled: undefined, // eslint-disable-line react/no-unused-state
    nextMove: undefined,
    nextGoban: undefined,
  };

  componentDidMount() {
    const link = this.props.match.params.link;
    axios.get(`/api/game/${link}`)
      .then((response) => {
        const {
          finished,
          goban_size: gobanSize,
          is_black: isBlack,
          move,
          moves,
          result,
          move_submit_enabled: moveSubmitEnabled,
          undo_requests_enabled: undoRequestsEnabled,
          chat_enabled: chatEnabled,
        } = response.data;

        const gobanHistory = [[...Array(gobanSize)].map(() => Array(gobanSize))];
        let goban = gobanHistory[0];
        let capturedBlack = 0;
        let capturedWhite = 0;
        let recentMove = [null, null];
        let countPassesInARow = 0;

        moves.forEach((moveInfo, index) => {
          const {
            order,
            pass,
            x, y,
          } = moveInfo;
          const { goban: newGoban, captured, error } = updateGoban(goban, order, x, y, pass);
          if (error) {
            // eslint-disable-next-line no-console
            console.log(error);
          }
          if (index % 2 === 0) {
            capturedBlack += captured;
          } else {
            capturedWhite += captured;
          }
          gobanHistory.push(newGoban);
          goban = newGoban;
          recentMove = pass ? [null, null] : [x, y];
          if (pass) {
            countPassesInARow += 1;
          } else {
            countPassesInARow = 0;
          }
        });

        this.setState({
          finished,
          result,
          gobanSize,
          isBlack,
          capturedBlack,
          capturedWhite,
          move,
          gobanHistory,
          recentMove,
          countPassesInARow,
          moveSubmitEnabled,
          undoRequestsEnabled, // eslint-disable-line react/no-unused-state
          chatEnabled, // eslint-disable-line react/no-unused-state
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error);
      });

    const wsScheme = (document.location.protocol === 'https:') ? 'wss' : 'ws';
    this.socket = new WebSocket(`${wsScheme}://${document.location.host}/api/ws/${link}`);
    this.socket.addEventListener('open', () => {
      // eslint-disable-next-line no-console
      console.log('WebSocket connected.');
    });
    this.socket.addEventListener('close', () => {
      // eslint-disable-next-line no-console
      console.log('WebSocket closed.');
    });

    this.socket.addEventListener('message', this.onWebSockerMessageHandler);
  }

  onWebSockerMessageHandler = (event) => {
    // eslint-disable-next-line no-console
    console.log('<- ', event.data);

    const data = JSON.parse(event.data);

    switch (data.type) {
      case 'game_move':
        (() => {
          const {
            move_no: moveNo,
            x,
            y,
            pass,
          } = data;
          const { goban, captured, error } = updateGoban(
            this.state.gobanHistory[this.state.move],
            this.state.move,
            x, y, pass,
          );
          if (error) {
            // eslint-disable-next-line no-console
            console.log(error);
            return;
          }

          // ko rule
          if (
            !pass && this.state.move > 0
            && isGobanEqual(goban, this.state.gobanHistory[this.state.move - 1])
          ) {
            // eslint-disable-next-line no-console
            console.log('Ko rule violation detected!');
            return;
          }

          // update goban
          this.setState((state) => {
            let capturedBlack = state.capturedBlack;
            let capturedWhite = state.capturedWhite;
            let countPassesInARow = state.countPassesInARow;

            if (moveNo % 2 === 0) {
              capturedBlack += captured;
            } else {
              capturedWhite += captured;
            }

            if (pass) {
              countPassesInARow += 1;
            } else {
              countPassesInARow = 0;
            }

            return {
              move: moveNo + 1,
              gobanHistory: state.gobanHistory.concat([goban]),
              capturedBlack,
              capturedWhite,
              recentMove: pass ? [null, null] : [x, y],
              countPassesInARow,
              nextMove: undefined,
              nextGoban: undefined,
            };
          });
        })();
        break;
      case 'game_resign':
        (() => {
          const {
            finished,
            finish_date: finishDate,
            result,
          } = data;
          this.setState({
            finished,
            result,
            finishDate, // eslint-disable-line react/no-unused-state
            nextMove: undefined,
            nextGoban: undefined,
          });
        })();
        break;
      default:
        // eslint-disable-next-line no-console
        console.log(`Unexpected message type: ${data.type}`);
    }
  }

  snackbarCloseHandler = () => {
    this.setState({
      errorOpened: false,
    });
  }

  showResignConfirmHandler = () => {
    this.setState({
      resignDialogOpened: true,
    });
  }

  cancelResignConfirmHandler = () => {
    this.setState({
      resignDialogOpened: false,
    });
  }

  resignHandler = () => {
    this.socket.send(JSON.stringify({
      type: 'game_resign',
    }));
    this.setState({
      resignDialogOpened: false,
    });
  }

  sendMove = (move, x, y, pass = false) => {
    const msg = JSON.stringify({
      type: 'game_move',
      move_no: move,
      x,
      y,
      pass,
    });
    // eslint-disable-next-line no-console
    console.log('->', msg);
    this.socket.send(msg);
  }

  doMove = (x, y, pass = false) => {
    const move = this.state.move;
    if (move % 2 === Number(this.state.isBlack)) {
      // eslint-disable-next-line no-console
      console.log('Its not your turn!');
      return;
    }

    const { goban, error } = updateGoban(
      this.state.gobanHistory[move],
      move,
      x, y, pass,
    );
    if (error) {
      this.setState({
        errorOpened: true,
        errorMessage: error,
      });
      // eslint-disable-next-line no-console
      console.log(error);
      return;
    }

    // ko rule
    if (!pass && move > 0 && isGobanEqual(goban, this.state.gobanHistory[move - 1])) {
      const koError = 'Ko rule violation detected!';
      this.setState({
        errorOpened: true,
        errorMessage: koError,
      });
      // eslint-disable-next-line no-console
      console.log(koError);
      return;
    }

    if (this.state.moveSubmitEnabled) {
      if (pass) {
        this.sendMove(move, x, y, pass);
      } else {
        this.setState((state) => {
          if (state.nextMove && x === state.nextMove[0] && y === state.nextMove[1]) {
            return {
              nextMove: undefined,
              nextGoban: undefined,
            };
          }
          return {
            nextMove: [x, y],
            nextGoban: goban,
          };
        });
      }
    } else {
      this.sendMove(move, x, y, pass);
    }
  }

  soundsToggleHandler = () => {
    this.setState(state => ({
      mute: !state.mute,
    }));
  }

  render() {
    const nextMoveColor = (this.state.move % 2 === 0) ? 'black' : 'white';
    const nextMovePlayer = (this.state.move % 2 !== Number(this.state.isBlack)) ? 'you' : 'your opponent';
    let goban = null;
    let finishButton = null;
    let submitButton = null;

    if (!this.state.finished) {
      if (this.state.moveSubmitEnabled && this.state.nextMove) {
        submitButton = (
          <Button
            color="primary"
            variant="outlined"
            onClick={() => this.sendMove(
              this.state.move,
              this.state.nextMove[0],
              this.state.nextMove[1],
              false,
            )}
          >
            Submit
          </Button>
        );
      } else {
        submitButton = (
          <Button
            disabled={this.state.move % 2 === Number(this.state.isBlack)}
            color="primary"
            variant="outlined"
            onClick={() => this.doMove(-1, -1, true)}
          >
            Pass
          </Button>
        );
      }
      if (this.state.countPassesInARow < 2) {
        finishButton = (
          <Button
            variant="outlined"
            onClick={() => this.showResignConfirmHandler()}
          >
            Resign
          </Button>
        );
      } else {
        finishButton = (
          <Button
            color="primary"
            variant="contained"
          >
            Finish Game
          </Button>
        );
      }
    }

    const actionButtons = (
      <div className="action-buttons">
        {submitButton}
        {finishButton}
      </div>
    );

    if (this.state.gobanSize > 0) {
      goban = (
        <>
          <p>
            Move #
            {this.state.move + 1}
            ,
            <b>{nextMoveColor}</b>
            {' '}
            to go (
            {nextMovePlayer}
            )
          </p>
          <p>
            Black captured:
            {this.state.capturedBlack}
          </p>
          <p>
            White captured:
            {this.state.capturedWhite}
          </p>
          {this.state.finished ? (
            <p>
              Result:
              {this.state.result}
            </p>
          ) : null}
          <div className="GameGoban">
            <GobanKonva
              showHover={
                !this.state.finished
                && Number(!this.state.isBlack) === this.state.move % 2
              }
              recentMove={this.state.nextMove || this.state.recentMove}
              size={this.state.gobanSize}
              stones={this.state.nextGoban || this.state.gobanHistory[this.state.move]}
              move={this.state.move}
              onMove={(!this.state.finished) ? this.doMove : () => {
                // eslint-disable-next-line no-console
                console.log('Game is finished!');
              }}
              mute={this.state.mute}
            />
          </div>
          {actionButtons}
        </>
      );
    }

    return (
      <>
        <div className="settings">
          <IconButton
            title={this.state.mute ? 'Sounds off' : 'Sounds on'}
            aria-label="Mute/unmute"
            color="inherit"
            onClick={this.soundsToggleHandler}
          >
            {
              (this.state.mute)
                ? <VolumeOffIcon />
                : <VolumeUpIcon />
            }
          </IconButton>
        </div>
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
          message={(
            <span id="message-id">
              You can&apos;t go here:
              {this.state.errorMessage}
            </span>
          )}
          open={this.state.errorOpened}
          autoHideDuration={2500}
          onClose={this.snackbarCloseHandler}
          TransitionComponent={TransitionUp}
          action={(
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={this.snackbarCloseHandler}
            >
              <CloseIcon />
            </IconButton>
          )}
        />
        <Dialog
          open={this.state.resignDialogOpened}
          onClose={this.cancelResignConfirmHandler}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Confirm resignation</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to resign? Game will be finished.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.cancelResignConfirmHandler}
              color="primary"
              autoFocus
            >
              Cancel
            </Button>
            <Button
              onClick={this.resignHandler}
              color="secondary"
            >
              Resign
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

Game.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
};

export default Game;
