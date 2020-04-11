import React from 'react';
import "./Field.css";
import Player from '../Player';
import { ArrowNegative, ArrowPositive } from './Arrow';

const Field = ({field: { index, goesTo, sleep, x, y }, players = []}) => {
    return (
        <div
            className={`field ${sleep > 0 ? 'banana' : ''}`}
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
                          <Player key={p.index} player={p} inField />
                        ))
                    }
                </div>
              )
            }
        </div>
    )
};

export default Field
