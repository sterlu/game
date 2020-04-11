import React from 'react';
import "./Player.css";
import skin1 from './skins/Player 1.svg';
import skin2 from './skins/Player 2.svg';
import skin3 from './skins/Player 3.svg';
import skin4 from './skins/Player 4.svg';
import skin5 from './skins/Player 5.svg';
import skin6 from './skins/Player 6.svg';
import skin7 from './skins/Player 7.svg';
import skin8 from './skins/Player 8.svg';
import skin9 from './skins/Player 9.svg';
import skin10 from './skins/Player 10.svg';
import skin11 from './skins/Player 11.svg';
import skin12 from './skins/Player 12.svg';
import skin13 from './skins/Player 13.svg';
const skins = [skin1, skin2, skin3, skin4, skin5, skin6, skin7, skin8, skin9, skin10, skin11, skin12, skin13,];

const Player = ({ player: { id, name, skinIndex, position, fieldIndex }, inField = false}) => {
    return (
      <div
        className="player"
        title={name}
        data-name={name}
        style={{
            backgroundImage: `url("${skins[skinIndex - 1]}")`,
            position: inField ? 'static' : 'absolute',
            left: `${position.left}rem`,
            top: `${position.top}rem`,
            visibility: (!inField && (fieldIndex === 0 || fieldIndex === 50)) ? 'hidden' : 'visible'
        }}
      >
        {name.substr(0, 1)}
      </div>
    )
};

export default Player
