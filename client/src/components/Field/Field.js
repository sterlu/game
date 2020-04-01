import React from 'react';
import "./Field.css";
import Player from '../Player';
import { ArrowNegative, ArrowPositive } from './Arrow';

const Field = ({field: { index, goesTo, sleep }, players = []}) => {
    let fromPos, toPos;
    if (goesTo) {
      const fromField = document.getElementById(`field-${index}`);
      const toField = document.getElementById(`field-${goesTo}`);
      if (fromField && toField) {
        fromPos = {
          top: fromField.offsetTop,
          left: fromField.offsetLeft,
        };
        toPos = {
          top: toField.offsetTop,
          left: toField.offsetLeft,
        };
      }
    }

    return (
        <div className={`field ${sleep > 0 ? 'banana' : ''}`} id={`field-${index}`}>
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
            {
              fromPos && toPos && (
                goesTo > index
                  ? <ArrowPositive fromPos={fromPos} toPos={toPos} diff={index - goesTo} />
                  : <ArrowNegative fromPos={fromPos} toPos={toPos} diff={goesTo - index} />
              )
            }
        </div>
    )
};

export default Field
