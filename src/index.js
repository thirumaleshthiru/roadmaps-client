import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './utils/AuthConext';
 
import { HeadProvider } from "react-head";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <HeadProvider>
      <App />
      </HeadProvider>
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

 