import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import Home from './windows/home/Home';
import EditProject from './windows/edit-project/EditProject'
import { init } from './data';
import Dialog from './windows/dialog/Dialog';
import ErrorDialog from './windows/dialog/ErrorDialog';
import TextInput from './windows/dialog/TextInput';
import Project from './windows/project/Project';

init();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/dialog/base" element={<Dialog />} />
        <Route path="/dialog/error" element={<ErrorDialog />} />
        <Route path="/dialog/text" element={<TextInput />} />

        <Route path="/home" element={<Home />} />
        <Route path="/edit-project" element={<EditProject />} />
        <Route path="/project" element={<Project />} />
      </Routes>
    </Router>
  </React.StrictMode>
);