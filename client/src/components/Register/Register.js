import React, { Component } from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import history from '../../History';
import { Button } from 'react-bootstrap';
import SocketContext from '../../Socket-context';



//TODO change to class,add state and add onClick and onChange functions

const Register = props => (
    <div>
        <label> Unesite ime: </label>
        <input type='text' id='imeIgraca'/>
        <Button variant="btn btn-primary" onClick={() => {
            props.socket.emit('register', document.getElementById('imeIgraca').value);
            history.push('/table')
            }
            }> Unesi </Button>
    </div>
)


const RegisterSocket = props => (
    <SocketContext.Consumer>
        {socket => <Register {...props} socket={socket} />}
    </SocketContext.Consumer>
  
)

export default RegisterSocket;