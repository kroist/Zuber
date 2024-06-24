import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'leaflet/dist/leaflet.css';
import OpenLobby from './OpenLobby';
import KrakowMapComponent from './KrakowMapComponent';

function App() {
  return (
    <div>
      <KrakowMapComponent />
    </div>
  );
}

export default App;
