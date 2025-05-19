import logo from '../logo.svg';
import './App.css';
import React, { useState } from 'react';
import Header from './Header';
import AppContent from './AppContent';
import { AuthContext } from './AuthContext';

function App() {
  const [role, setRole] = useState(null);
  const [view, setView] = useState('welcome');

  return (
    <AuthContext.Provider value={{ role, setRole, view, setView }}>
      <div className="App">
        <Header pageTitle="Frontend authenticated with JWT" logoSrc={logo} />
        <div className="container-fluid">
          <AppContent />
        </div>
      </div>
    </AuthContext.Provider>
  );
}

export default App;