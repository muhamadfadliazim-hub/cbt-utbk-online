import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; 
import App from './App';

console.log("Memulai Aplikasi..."); // Cek Console browser nanti

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("React berhasil dimount ke Root");
} else {
  console.error("FATAL: Elemen ID 'root' tidak ditemukan di index.html");
}