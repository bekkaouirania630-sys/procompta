import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import { DataProvider } from './context/DataContext';

// Lazy load all modules for performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Comptabilite = React.lazy(() => import('./pages/Comptabilite'));
const ChartOfAccounts = React.lazy(() => import('./pages/ChartOfAccounts'));
const PlanTiers = React.lazy(() => import('./pages/PlanTiers'));
const JournalsManager = React.lazy(() => import('./pages/JournalsManager'));
const Invoices = React.lazy(() => import('./pages/Invoices'));
const Ocr = React.lazy(() => import('./pages/Ocr'));
const Tresorerie = React.lazy(() => import('./pages/Tresorerie'));
const RH = React.lazy(() => import('./pages/RH'));
const Fiscalite = React.lazy(() => import('./pages/Fiscalite'));
const Reporting = React.lazy(() => import('./pages/Reporting'));
const Budget = React.lazy(() => import('./pages/Budget'));
const Parametres = React.lazy(() => import('./pages/Parametres'));
const AuditLog = React.lazy(() => import('./pages/AuditLog'));
const Stock = React.lazy(() => import('./pages/Stock'));

// React Query client – globally configured
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,   // 2 min
      cacheTime: 1000 * 60 * 10,  // 10 min
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <DataProvider>
          <React.Suspense fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-bg relative">
              <div className="absolute inset-0 bg-primary-glow opacity-20 animate-pulse"></div>
              <div className="flex flex-col items-center gap-4 z-10">
                <div className="w-12 h-12 rounded-2xl border-2 border-primary border-t-transparent animate-spin"></div>
                <div className="premium-font text-xs font-bold tracking-widest text-primary opacity-80 uppercase">Initialisation de l'Intelligence ERP...</div>
              </div>
            </div>
          }>
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
                <Route path="stock" element={<Stock />} />
                <Route path="rh" element={<RH />} />
                <Route path="fiscalite" element={<Fiscalite />} />
                <Route path="reporting" element={<Reporting />} />
                <Route path="budget" element={<Budget />} />
                <Route path="parametres" element={<Parametres />} />
                <Route path="audit-log" element={<AuditLog />} />
                
                <Route path="*" element={
                  <div style={{ textAlign: 'center', padding: 80 }}>
                    <div style={{ fontSize: 48 }}>🚧</div>
                    <h3 className="premium-font" style={{ fontSize: 20, fontWeight: 800, marginTop: 16 }}>En construction</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Cette page est en cours de développement.</p>
                  </div>
                } />
              </Route>
            </Routes>
          </React.Suspense>
        </DataProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
