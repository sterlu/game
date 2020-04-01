import React, { Component } from 'react';
import Field from '../Field';
import history from '../../History';
import { Button } from 'react-bootstrap';
import SocketContext from '../../Socket-context';

// implement state

class Table extends Component {

    constructor(){
        super();
    }
// TODO here goes socket emiting for rolling

    onClick = () => {
        this.props.socket.emit('game turn');
    }

    componentDidMount(){
        this.props.socket.emit('game start');

        this.props.socket.on('state', (msg) => {
            console.log(msg);
            });
        this.props.socket.on('rolled', (msg) =>{
            console.log(msg.player.name);
            console.log(msg.rolled);
        });
    }
    render(){

        return (
            <div className="table">
                {/* TODO onClick function */}
                <Button>Roll the dice</Button>
                {
                    // TODO change number of fields
                    Array.from(Array(42)).map((_,i) => (
                        <Field key = {i} id = {i}>
                        </Field>
                    ))
                }

            </div>
        );
    }
}

const TableSocket = props => (
    <SocketContext.Consumer>
        {socket => <Table {...props} socket={socket} />}
    </SocketContext.Consumer>
  
)

export default TableSocket;