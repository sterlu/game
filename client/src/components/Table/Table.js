import React, { Component } from 'react';
import Field from '../Field';
import history from '../../History';


// implement state

class Table extends Component {

    constructor(){
        super();
    }

    render(){
        return (
            <div className="table">
                 
                {
                    // TODO change number of fields
                    Array.from(Array(42)).map((_,i) => (
                        <Field key = {i} id = {i}>
                        </Field>
                    ))
                }

            </div>
        );
    }
}

export default Table;