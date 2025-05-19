import React from 'react';

export const AuthContext = React.createContext({
  role: null,
  setRole: () => {},
  view: 'welcome',
  setView: () => {},
});