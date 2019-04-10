import React, { Component } from 'react';
import './App.css';
import main from './images/v0_main.jpg';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={main} alt={"Main Site"} />
        </header>
      </div>
    );
  }
}

export default App;
