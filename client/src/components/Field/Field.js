import React from 'react';
import "./Field.css";
import Player from '../Player';
import { ArrowNegative, ArrowPositive } from './Arrow';

const Field = ({field: { index, goesTo, sleep, x, y }, players = [], highlighted = false}) => {
    return (
        <div
            className={`field ${sleep > 0 ? 'sleep' : ''} ${highlighted ? 'highlighted' : ''} ${(index === 0 || index === 50) ? 'special' : ''}`}
            id={`field-${index}`}
            style={{
                left: `${x/10 - 2.5}rem`,
                top: `${y/10 - 2.5}rem`,
            }}
        >
            <i>{index}</i>
            {
              (index === 0 || index === 50) && (
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
