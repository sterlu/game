import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Field from '../Field';
import history from '../../History';
import { Button } from 'react-bootstrap';
import SocketContext from '../../Socket-context';
import './TableSocket.css';
import Player from '../Player';
import { FIELDS, FIELDS_CHUNKED } from '../gameConfig';
import rollADie from 'roll-a-die';


// implement state

class Table extends Component {

    constructor(){
        super();

        this.state = {
            gameState: {
                players: [],
            },
            playerLocations: {},
            rolls: [],
        }
    }

    diceRoll = () => {
      const element = document.getElementById('dice');
      const val = this.state.rolls[this.state.rolls.length - 1].rolled;
      if (val) rollADie({
        element,
        numberOfDice: 1,
        values: [val],
        noSound: true,
        callback: () => {}
      });
    };

    onClick = () => {
        this.props.socket.emit('game turn');
        this.setState({
          gameState: {
            ...this.state.gameState,
            rolling: true,
          }
        });
    };

    componentDidMount(){
        this.props.socket.emit('game start');

        this.props.socket.on('state', (gameState) => {
            // console.log(gameState);
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
            }, this.diceRoll);
        });
    }
    render(){
        const { socket } = this.props;
        if (!socket.name) return (<Redirect to="/" />);
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
          <div className="wrapper">
            <div className="sidebar">
              <h4>Players</h4>
              <ul className="players">
                {
                  gameState.players.map((p, i) => (
                    <li key={p.id}>
                      {p.name} {i === gameState.turnOfPlayer && (<b>🎲</b>)}
                      {p.sleep === 1 && `🍌`}
                      {p.sleep === 2 && `🍌🍌`}
                    </li>
                  ))
                }
              </ul>

              <div>
                <Button onClick={this.onClick} disabled={!isPlayersTurn || gameState.rolling || gameState.state !== 1}>Roll 🎲</Button>
                <div id='dice' />
              </div>

              <h4>Rolls</h4>
              <ul className="rolls">
                {
                  [...rolls].reverse().map((r, i) => (
                    <li>{r.player.name}: {r.rolled}</li>
                  ))
                }
              </ul>
            </div>
            <div className="table">
                <div className="fields">
                    {
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
