import React from 'react';
import "./Field.css";

const Field = props => {
    return (
        <div className='field'>
            this is field num: 
            <p> {props.id} </p>
        </div>
    )
}

export default Field