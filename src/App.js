import React, { Component } from 'react';
import MuseumPlayground from "./MuseumPlayground";
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Museum Guard Problem</h1>
        </header>
        <MuseumPlayground/>
      </div>
    );
  }
}

export default App;
