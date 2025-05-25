import React, { Component } from 'react';

import './MainPage.scss'; //import scss

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.comeToHome();
  }
  comeToHome = () => {
    setTimeout(() => {
      this.props.navigate('/home');
    }, 0);
  };
  render() {
    return <p>Redirecting to Home...</p>;
  }
}
export default MainPage;