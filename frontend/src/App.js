import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChartOfAccounts from './pages/ChartOfAccounts';
import Comptabilite from './pages/Comptabilite';
import Ocr from './pages/Ocr';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="comptabilite" element={<Comptabilite />} />
          <Route path="plan-comptable" element={<ChartOfAccounts />} />
          <Route path="ocr" element={<Ocr />} />
          
          <Route path="*" element={<div className="empty"><div className="empty-icon">🚧</div><h3>En construction</h3><p>Cette page est en cours de développement.</p></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
