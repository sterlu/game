import React, { Component } from "react";
import { Router, Switch, Route } from "react-router-dom";
import history from './History';


import Table from './components/Table';
import Register from './components/Register';

export default class Routes extends Component {
    render() {
        return (
            <Router history={history}>
                <Switch>
                    <Route path="/" exact component={Register} />
                    <Route path="/table" component={Table} />
                </Switch>
            </Router>
        )
    }
}
