import React from 'react'
import ReactDOM from 'react-dom/client'

import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import App from './App'
import Login from './pages/Login'
import axios from 'axios';
import './index.css'


axios.defaults.baseURL = import.meta.env.VITE_CORE_API_BASE_URL;
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
    <BrowserRouter>
      {/* <App /> */}
      <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
        </Routes>
    </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)