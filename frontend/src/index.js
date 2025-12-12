import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Router WAJIB ada di sini
import './index.css';
import App from './App';

console.log("Memulai Aplikasi...");

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      {/* Bungkus App dengan BrowserRouter di sini */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  console.log("React berhasil dimount ke Root");
} else {
  console.error("FATAL: Elemen ID 'root' tidak ditemukan di index.html");
}