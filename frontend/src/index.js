import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Kita tidak menggunakan BrowserRouter di sini agar kontrol penuh ada di App.js
// Ini mencegah error routing di server statis Railway
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);