import React from 'react';
import "./Field.css";

const Field = ({id, players = []}) => {
    return (
        <div className='field'>
            <i>{id}</i>
            <div className="players">
                {
                    players.map(p => (
                      <div className="player" key={p.id} style={{ backgroundColor: p.color }}>
                          {p.name.substr(0, 1)}
                      </div>
                    ))
                }
            </div>
        </div>
    )
};

export default Field
