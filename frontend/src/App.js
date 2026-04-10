import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChartOfAccounts from './pages/ChartOfAccounts';
import Comptabilite from './pages/Comptabilite';
import Ocr from './pages/Ocr';
import PlanTiers from './pages/PlanTiers';
import JournalsManager from './pages/JournalsManager';
import Invoices from './pages/Invoices';
import RH from './pages/RH';
import Fiscalite from './pages/Fiscalite';
import Reporting from './pages/Reporting';
import Budget from './pages/Budget';
import Tresorerie from './pages/Tresorerie';
import Parametres from './pages/Parametres';
import { DataProvider } from './context/DataContext';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <DataProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="comptabilite" element={<Comptabilite />} />
          <Route path="plan-comptable" element={<ChartOfAccounts />} />
          <Route path="plan-tiers" element={<PlanTiers />} />
          <Route path="journaux" element={<JournalsManager />} />
          <Route path="factures" element={<Invoices />} />
          <Route path="ocr" element={<Ocr />} />
          <Route path="tresorerie" element={<Tresorerie />} />
          <Route path="rh" element={<RH />} />
          <Route path="fiscalite" element={<Fiscalite />} />
          <Route path="reporting" element={<Reporting />} />
          <Route path="budget" element={<Budget />} />
          <Route path="parametres" element={<Parametres />} />
          
          <Route path="*" element={<div className="empty"><div className="empty-icon">🚧</div><h3>En construction</h3><p>Cette page est en cours de développement.</p></div>} />
        </Route>
      </Routes>
      </DataProvider>
    </Router>
  );
}

export default App;
