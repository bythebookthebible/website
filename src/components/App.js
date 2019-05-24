import React, { Component } from 'react';
import '../css/App.css';
import Nav from './NavBar'
import Body from "./Body";
import ProductBar from "./ProductBar";
import QuoteBar from "./QuoteBar";

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="col">
          <Nav />
          <div className="construction">This site is currently under construction.</div>
          <div className="Container">
            <Body />
            <ProductBar />
            <QuoteBar />
          </div>
        </div>
      </div>
    );
  }
}