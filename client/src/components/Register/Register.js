import React, { Component } from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import history from '../../History';
import { Button } from 'react-bootstrap';


import  Table  from '../Table';


const Register = () => (
    <div>
        <label for='imeIgraca'> Unesite ime: </label>
        <input type='text' id='imeIgraca'/>
        <Button variant="btn btn-success" onClick={() => history.push('/table')}> Unesi </Button>
    </div>
)

export default Register;