import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // IMPORT INI PENTING
import './index.css';
import App from './App';

console.log("Memulai Aplikasi..."); 

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      {/* Router dipasang di sini, di paling luar */}
      <BrowserRouter> 
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  console.log("React berhasil dimount ke Root");
} else {
  console.error("FATAL: Elemen ID 'root' tidak ditemukan di index.html");
}