import React, { Component } from 'react';
import './App.css';

import Game from './containers/Game/Game';
import { BrowserRouter, Route, Link } from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Route path='/game/:link' component={Game} />
          <Route exact path='/' render={() => (
            <div>
              <h1>New game</h1>
              <p>Nothing here yet.</p>
              <Link to="/game/a0eb563da2d278e448943b4372f831a6">Go game</Link>
            </div>
          )} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
