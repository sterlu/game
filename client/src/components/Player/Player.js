import React from 'react';
import "./Player.css";

const Player = ({ player: { id, name, color, position, fieldIndex }, inField = false}) => {
    return (
      <div
        className="player"
        title={name}
        style={{
        backgroundColor: color,
        position: inField ? 'static' : 'absolute',
        left: `${position.left}rem`,
        top: `${position.top}rem`,
        visibility: (!inField && (fieldIndex === 0 || fieldIndex === 50)) ? 'hidden' : 'visible'
      }}>
        {name.substr(0, 1)}
      </div>
    )
};

export default Player
