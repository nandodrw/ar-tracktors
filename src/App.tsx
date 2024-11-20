import React from 'react';
import './App.css';
import {Navigation} from './pages/navigation'


function App({db}: {db: any}) {
  return <Navigation db={db} />
}

export default App;
