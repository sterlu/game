import React, { Component } from "react";
import './App.css';
import Register from './components/Register'
import openSocket from "socket.io-client";
import Routes from './Routes'
import SocketContext from './Socket-context';



class App extends Component {
  constructor(){
    super();
      this.state = {
          response:  false,
          // TODO change port
          endpoint: "http://localhost:6600"
      }
      this.socket = undefined;

  }

  componentDidMount() {
    // const { endpoint } = this.state;
    // this.socket = openSocket(endpoint);
    // socket.on("FromAPI", data => this.setState({ response: data }));
  }

  render() {
    // const { response } = this.state
    return (
      <div>
        
        <Register/>
      </div> 
    );
  }
}
export default App;
