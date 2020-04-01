import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Field from '../Field';
import history from '../../History';
import { Button } from 'react-bootstrap';
import SocketContext from '../../Socket-context';
import './TableSocket.css';

// implement state

class Table extends Component {

    constructor(){
        super();

        this.state = {
            gameState: {},
            playerLocations: {},
            rolls: [],
        }
    }

    onClick = () => {
        this.props.socket.emit('game turn');
    };

    componentDidMount(){
        this.props.socket.emit('game start');

        this.props.socket.on('state', (gameState) => {
            console.log(gameState);
            const playerLocations = [];
            gameState.players.forEach(p => {
                playerLocations[p.fieldIndex]
                  ? playerLocations[p.fieldIndex].push(p)
                  : playerLocations[p.fieldIndex] = [p]
            });
            this.setState({ gameState, playerLocations })
        });
        this.props.socket.on('rolled', (msg) =>{
            // console.log(msg.player.name, msg.rolled);
            this.setState({
                rolls: [...this.state.rolls, msg],
            });
        });
    }
    render(){
        const { gameState, playerLocations, rolls } = this.state;
        const { socket } = this.props;
        let isPlayersTurn = false;
        if (gameState.players && gameState.players[gameState.turnOfPlayer].id === socket.id) isPlayersTurn = true;

        if (!socket.name) return (<Redirect to="/" />);
        return (
            <div className="table">
                <div>
                    <Button onClick={this.onClick} disabled={!isPlayersTurn}>Roll the dice</Button>
                    {
                        rolls.length > 0 && (
                          <p>Last roll by {rolls[rolls.length - 1].player.name}: {rolls[rolls.length - 1].rolled}</p>
                        )
                    }
                </div>
                <div className="fields">
                    {
                        // TODO change number of fields
                        Array.from(Array(51)).map((_,i) => (
                            <Field key = {i} id = {i} players={playerLocations[i]}>
                            </Field>
                        ))
                    }
                </div>
            </div>
        );
    }
}

const TableSocket = props => (
    <SocketContext.Consumer>
        {socket => <Table {...props} socket={socket} />}
    </SocketContext.Consumer>

);

export default TableSocket;
