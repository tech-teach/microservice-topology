import React, { Component } from 'react';

// import Htop from './components/Htop';
import Htop from './components/Htop'
import './App.css';


class App extends Component {
  render() {
    return (
      <div>
        <div className="App">
          <Htop/>
        </div>
      </div>
    );
  }
}

export default App;
