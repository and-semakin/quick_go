import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Game from './containers/Game/Game';
import NewGame from './components/NewGame/NewGame';
import './App.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Route path='/game/:link' component={Game} />
          <Route exact path='/' component={NewGame} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
