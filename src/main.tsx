import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.tw.css';  // ← Import correto do Tailwind v4

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);