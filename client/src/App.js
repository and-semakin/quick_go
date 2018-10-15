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
              <Link to="/game/9d52fda6d8fbec80b75ef9de81bf774f">Go game</Link>
            </div>
          )} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
