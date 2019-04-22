import React, { Component } from 'react';
import Nav from './NavBar'
import '../css/App.css';
import LeftBar from "./LeftBar";
import Main from "./Main";
import RightBar from "./RightBar";

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <Nav />
            </div>
          </div>
            <div className="row">
              <div className="col-2">
                <LeftBar />
              </div>
              <div className="col-lg-8">
                <Main />
              </div>
              <div className="col-2">
                <RightBar />
              </div>
            </div>
          </div>
      </div>
    );
  }
}

export default App;
