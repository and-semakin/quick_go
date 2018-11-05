import React, { Component } from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';

import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';

import CopyButton from '../CopyButton/CopyButton';
import './NewGame.css';

class NewGame extends Component {
  state = {
    gobanSize: '9',
    gobanSizes: ['9', '13', '19'],
    moveSubmitEnabled: true,
    undoRequestsEnabled: true,
    blackLink: '',
    whiteLink: '',
  }

  handleGobanSizeChange = (event) => {
    this.setState({ gobanSize: event.target.value });
  };

  handleButtonClick = () => {
    const postData = new FormData();
    postData.set('goban_size', this.state.gobanSize);
    postData.set('move_submit_enabled', this.state.moveSubmitEnabled);
    postData.set('undo_requests_enabled', this.state.undoRequestsEnabled);
    axios.post('/api/new', postData).then((response) => {
      this.setState({
        blackLink: response.data.link_black,
        whiteLink: response.data.link_white,
      });
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });
  }

  handleSwitchToggle = name => (event) => {
    this.setState({ [name]: event.target.checked });
  }

  render() {
    const gobanSizesRadioButtons = this.state.gobanSizes.map(size => (
      <FormControlLabel
        key={size}
        value={size}
        control={<Radio />}
        label={`${String(size)} x ${String(size)}`}
      />
    ));

    const linkPrefix = '/game/';
    const fullLinkPrefix = document.location.origin + linkPrefix;

    let links = null;
    if (this.state.blackLink) {
      links = (
        <div>
          <div className="link-input">
            <TextField
              label="Black"
              variant="outlined"
              margin="dense"
              value={fullLinkPrefix + this.state.blackLink}
            />
            <CopyButton
              value={fullLinkPrefix + this.state.blackLink}
              width={69}
            >
              Copy
            </CopyButton>
            <Button onClick={() => {
              this.props.history.push(linkPrefix + this.state.blackLink);
            }}
            >
              Open
            </Button>
          </div>
          <div className="link-input">
            <TextField
              label="White"
              variant="outlined"
              margin="dense"
              value={fullLinkPrefix + this.state.whiteLink}
            />
            <CopyButton
              value={fullLinkPrefix + this.state.whiteLink}
              width={69}
            >
              Copy
            </CopyButton>
            <Button onClick={() => {
              this.props.history.push(linkPrefix + this.state.whiteLink);
            }}
            >
              Open
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h1>Play Go</h1>
        <div>
          <FormControl component="fieldset">
            <FormLabel component="legend">Goban Size</FormLabel>
            <RadioGroup
              aria-label="Goban size"
              name="gobanSize"
              value={this.state.gobanSize}
              onChange={this.handleGobanSizeChange}
            >
              {gobanSizesRadioButtons}
            </RadioGroup>

            <FormLabel component="legend">Settings</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={(
                  <Switch
                    checked={this.state.moveSubmitEnabled}
                    onChange={this.handleSwitchToggle('moveSubmitEnabled')}
                  />
                )}
                label="Submit move before send"
              />
              <FormControlLabel
                control={(
                  <Switch
                    checked={this.state.undoRequestsEnabled}
                    onChange={this.handleSwitchToggle('undoRequestsEnabled')}
                  />
                )}
                label="Allow undo"
              />
            </FormGroup>
          </FormControl>
        </div>
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleButtonClick}
          >
            Start!
          </Button>
        </div>
        {links}
      </div>
    );
  }
}

NewGame.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
};

export default NewGame;
