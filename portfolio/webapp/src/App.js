import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Header from './Header';
import Body from './Body';
import Footer from './Footer';
import Nav from './Nav';

import './App.css';

export default function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Nav />
        <Body />
        <Footer />
      </div>
    </Router>
  );
}
