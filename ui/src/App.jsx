import React, { Component } from 'react';

// import Htop from './components/Htop';
import FileUpload from './components/FileUpload'
import './App.css';


class App extends Component {
  render() {
    return (
      <div>
        <div className="App">
          <FileUpload/>
        </div>
      </div>
    );
  }
}
/*
        <div>
          <Htop ms={750} />
        </div>
*/

export default App;
