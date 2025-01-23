import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import App from './App'
import Login from './pages/Login'
import axios from 'axios';


axios.defaults.baseURL = "http://localhost:8090";
axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
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
