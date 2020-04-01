import React from 'react';
import "./Field.css";
import Player from '../Player';

const Field = ({id, players = []}) => {
    return (
        <div className='field' id={`field-${id}`}>
            <i>{id}</i>
          {
            (id === 0 || id === 51) && (
              <div className="players">
                  {
                      players.map(p => (
                        <Player key={p.id} player={p} inField />
                      ))
                  }
              </div>
            )
          }
        </div>
    )
};

export default Field
