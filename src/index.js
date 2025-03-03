import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './utils/AuthConext';
import {HelmetProvider} from 'react-helmet-async'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <HelmetProvider>
      <App />
      </HelmetProvider>
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

 