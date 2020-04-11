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

import skin1 from '../Player/skins/Player 1.svg';
import skin2 from '../Player/skins/Player 2.svg';
import skin3 from '../Player/skins/Player 3.svg';
import skin4 from '../Player/skins/Player 4.svg';
import skin5 from '../Player/skins/Player 5.svg';
import skin6 from '../Player/skins/Player 6.svg';
import skin7 from '../Player/skins/Player 7.svg';
import skin8 from '../Player/skins/Player 8.svg';
import skin9 from '../Player/skins/Player 9.svg';
import skin10 from '../Player/skins/Player 10.svg';
import skin11 from '../Player/skins/Player 11.svg';
import skin12 from '../Player/skins/Player 12.svg';
import skin13 from '../Player/skins/Player 13.svg';
const skins = [skin1, skin2, skin3, skin4, skin5, skin6, skin7, skin8, skin9, skin10, skin11, skin12, skin13,];

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
        this.props.socket.on('end', (msg) =>{
            // console.log(msg.player.name, msg.rolled);
            alert(`Congratulations ${msg.player.name}`);
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
            const remScale = document.getElementById(`field-1`).offsetHeight / 5;
            console.log(p.name, field, remScale, field.offsetTop, field.offsetLeft, field.offsetTop / remScale, field.offsetLeft / remScale);
            p.position = {
                top: field.offsetTop / remScale,
                left: field.offsetLeft / remScale,
            }
          })
        }
        const currentPlayer = gameState.players.length && gameState.players[gameState.turnOfPlayer];

        return (
          <div className="wrapper">
            <div className="sidebar">
              <h4>Players</h4>
              <ul className="players">
                {
                  gameState.players.map((p, i) => (
                    <li key={p.id} className={i === gameState.turnOfPlayer ? 'active' : ''}>
                        <div className="avatar" style={{ backgroundImage: `url("${skins[p.skinIndex-1]}")` }} />
                        {p.name}
                        <b>
                          {i === gameState.turnOfPlayer && '🎲'}
                          {p.sleep === 1 && 'zZ'}
                          {p.sleep === 2 && 'zZzZ'}
                        </b>
                    </li>
                  ))
                }
              </ul>

              <div>
                <button onClick={this.onClick} disabled={!isPlayersTurn || gameState.rolling || gameState.state !== 1}>Roll 🎲</button>
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
                            <Field key={f.index} field={f} players={playerLocations[f.index]} highlighted={currentPlayer && currentPlayer.fieldIndex === f.index} />
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
