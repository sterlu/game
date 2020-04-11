import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import Routes from './Routes';
import SocketContext from './Socket-context';
import openSocket from "socket.io-client";


const socket = openSocket(`${document.location.hostname}:6600`);
// const socket = openSocket('http://localhost:6600/');


ReactDOM.render(
  <SocketContext.Provider value={socket}>
    <Router>
      <Routes />
    </Router>
  </SocketContext.Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
