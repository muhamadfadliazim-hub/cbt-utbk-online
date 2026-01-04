import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Wajib untuk Tailwind
import App from './App';
import 'katex/dist/katex.min.css'; // Wajib untuk Rumus MTK

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);