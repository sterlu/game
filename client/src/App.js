import React, { Component } from "react";
import './App.css';
import Register from './components/Register'
import socketIOClient from "socket.io-client";
import Routes from './Routes'


class App extends Component {
  constructor(){
    super();
      this.state = {
          response:  false,
          // TODO change port
          endpoint: "http://127.0.0.1:4001"
      }

  }

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("FromAPI", data => this.setState({ response: data }));
  }

  render() {
    const { response } = this.state
    return (
      <div>
        <Register/>
      </div> 
    );
  }
}
export default App;
