import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';

import './NewGame.css';

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
}

class NewGame extends Component {
    state = {
        gobanSize: '9',
        gobanSizes: ['9', '13', '19'],
        blackLink: '',
        whiteLink: '',
    }

    handleGobanSizeChange = event => {
        console.log(event);
        this.setState({ gobanSize: event.target.value });
    };

    handleButtonClick = () => {
        axios.post('/api/new', {
            goban_size: this.state.gobanSize
        }).then(response => {
            this.setState({
                blackLink: response.data.link_black,
                whiteLink: response.data.link_white,
            });
        }).catch(error => {
            console.log(error);
        });
    }

    render() {
        const gobanSizesRadioButtons = this.state.gobanSizes.map(size => (
            <FormControlLabel
                key={size}
                value={size}
                control={<Radio />}
                label={String(size) + ' x ' + String(size)} />
        ));

        const link_prefix = '/game/';
        const full_link_prefix = document.location.origin + link_prefix;

        let links = null;
        if (this.state.blackLink) {
            links = (
                <div>
                    <div className="link-input">
                        <TextField
                            label="Black"
                            variant="outlined"
                            margin="dense"
                            value={full_link_prefix + this.state.blackLink}
                        />
                        <Button onClick={() => {
                            copyTextToClipboard(full_link_prefix + this.state.blackLink);
                        }}>Copy</Button>
                        <Button onClick={() => {
                            this.props.history.push(link_prefix + this.state.blackLink);
                        }}>Open</Button>
                    </div>
                    <div className="link-input">
                        <TextField
                            label="White"
                            variant="outlined"
                            margin="dense"
                            value={full_link_prefix + this.state.whiteLink}
                        />
                        <Button 
                        onClick={() => {
                            copyTextToClipboard(full_link_prefix + this.state.whiteLink);
                        }}>Copy</Button>
                        <Button onClick={() => {
                            this.props.history.push(link_prefix + this.state.whiteLink);
                        }}>Open</Button>
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
                    </FormControl>
                </div>
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleButtonClick}
                    >Start!</Button>
                </div>
                {links}
            </div>
        );
    }
}

export default NewGame;