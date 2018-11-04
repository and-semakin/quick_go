import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Game from './containers/Game/Game';
import NewGame from './components/NewGame/NewGame';
import './App.css';

const app = () => (
  <BrowserRouter>
    <div className="App">
      <Route path="/game/:link" component={Game} />
      <Route exact path="/" component={NewGame} />
    </div>
  </BrowserRouter>
);

export default app;
