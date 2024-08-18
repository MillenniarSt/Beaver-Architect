import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import Home from './windows/home/Home';
import EditProject from './windows/edit-project/EditProject'
import { init } from './data';

init();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/edit-project" element={<EditProject />} />
      </Routes>
    </Router>
  </React.StrictMode>
);