import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Field from '../Field';
import history from '../../History';
import { Button } from 'react-bootstrap';
import SocketContext from '../../Socket-context';
import './TableSocket.css';
import Player from '../Player';
import { FIELDS } from '../gameConfig';

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
        this.setState({
          gameState: {
            ...this.state.gameState,
            rolling: true,
          }
        })
    };

    componentDidMount(){
        this.props.socket.emit('game start');

        this.props.socket.on('state', (gameState) => {
            console.log(gameState);
            const playerLocations = {};
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
        const { socket } = this.props;
        // if (!socket.name) return (<Redirect to="/" />);
        const { gameState, playerLocations, rolls } = this.state;
        let isPlayersTurn = false;
        if (gameState.players && gameState.players.length && gameState.players[gameState.turnOfPlayer].id === socket.id) isPlayersTurn = true;
        if (gameState.players) {
          gameState.players.forEach((p, i) => {
            const field = document.getElementById(`field-${p.fieldIndex}`);
            p.position = {
                top: field.offsetTop,
                left: field.offsetLeft,
            }
          })
        }

        return (
            <div className="table">
                <div>
                    <Button onClick={this.onClick} disabled={!isPlayersTurn || gameState.rolling}>Roll the dice</Button>
                    <div className="stats">
                      {
                          gameState.turnOfPlayer >= 0 && (
                            <div>Now playing: {gameState.players[gameState.turnOfPlayer].name}  </div>
                          )
                      }
                      {
                          rolls.length > 0 && (
                            <div>Last roll by {rolls[rolls.length - 1].player.name}: {rolls[rolls.length - 1].rolled}</div>
                          )
                      }
                    </div>
                </div>
                <div className="fields">
                    {
                        // TODO change number of fields
                        FIELDS.map((f) => (
                            <Field key={f.index} field={f} players={playerLocations[f.index]} />
                        ))
                    }
                    {
                        gameState.players &&
                        gameState.players.map((p) => (<Player key={p.id} player={p} />))
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
