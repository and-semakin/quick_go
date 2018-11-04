import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from '@material-ui/icons/Check';

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text);
}

class CopyButton extends Component {
  state = {
    done: false,
  }

  onClickHandler = () => {
    copyTextToClipboard(this.props.value);
    this.setState({ done: true });
    setTimeout(() => {
      this.setState({ done: false });
    }, 1500);
  }

  render() {
    const button = (this.state.done)
      ? (
        <IconButton>
          <CheckIcon fontSize="small" />
        </IconButton>
      )
      : (
        <Button
          onClick={this.onClickHandler}
        >
          {this.props.children}
        </Button>
      );
    return (
      <div style={{
        width: `${this.props.width}px`,
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
      }}
      >
        {button}
      </div>
    );
  }
}

CopyButton.propTypes = {
  value: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  children: PropTypes.node,
};

CopyButton.defaultProps = {
  children: 'Copy',
};

export default CopyButton;
