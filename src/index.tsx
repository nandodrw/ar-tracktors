import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA3jSqDANzu8yCScJ5lAYIyuxgg6P33G3o",
    authDomain: "ar-navigation-533e7.firebaseapp.com",
    projectId: "ar-navigation-533e7",
    storageBucket: "ar-navigation-533e7.firebasestorage.app",
    messagingSenderId: "555192352525",
    appId: "1:555192352525:web:a75c996384b26911d9ba44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App db={db}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
