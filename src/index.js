import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client'; // Import createRoot from react-dom/client
import App from './App'; // Import your main component
import '@fortawesome/fontawesome-free/css/all.min.css';
// Import Font Awesome icons
import { faHome, faInfoCircle, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './css/App.scss';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);