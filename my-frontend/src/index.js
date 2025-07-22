import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/normalize.css';
import './assets/css/vendor.css';
import './assets/style.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// Only need to import bootstrap CSS once
// import 'bootstrap/dist/css/bootstrap.min.css';

// import the Provider!
import { GlobalLoaderProvider } from './components/GlobalLoaderContext';

// Mount to 'root'
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <GlobalLoaderProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GlobalLoaderProvider>
  </React.StrictMode>
);

reportWebVitals();
