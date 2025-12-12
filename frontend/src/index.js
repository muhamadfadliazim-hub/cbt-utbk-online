import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Pastikan ini tetap ada (meskipun isinya kosong/tailwind)
import App from './App';

// Mencari elemen 'root' di index.html
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Gagal menemukan elemen ID 'root'. Aplikasi tidak bisa berjalan.");
}