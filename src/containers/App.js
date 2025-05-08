// src/containers/App.js
import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '../routes';
import 'bootstrap/dist/css/bootstrap.min.css';
class App extends Component {
  render() {
    return (
      <Fragment>
        <Router>
          <div>
            <AppRoutes />
          </div>
        </Router>
      </Fragment>
    );
  }
}

export default App;