import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    accounts: [],
    journals: [],
    tiers: [],
    invoices: [],
    entries: [],
    employees: [],
    payslips: [],
    fixed_assets: [],
    budgets: [],
    stats: {
      ca: 0,
      charges: 0,
      tvaCollectee: 0,
      tvaDeductible: 0,
      resultat: 0
    }
  });

  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json' 
    };

    try {
      const [
        accounts, journals, tiers, invoices, entries, 
        employees, payslips, fixedAssets, budgets, dashboard
      ] = await Promise.all([
        fetch('http://localhost:8000/api/accounting/accounts', { headers }).then(r => r.json()),
        fetch('http://localhost:8000/api/accounting/journals', { headers }).then(r => r.json()),
        fetch('http://localhost:8000/api/tiers', { headers }).then(r => r.json()),
        fetch('http://localhost:8000/api/invoices', { headers }).then(r => r.json()),
        fetch('http://localhost:8000/api/accounting/entries', { headers }).then(r => r.json()),
        fetch('http://localhost:8000/api/employees', { headers }).then(r => r.json()),
        fetch('http://localhost:8000/api/payslips', { headers }).then(r => r.json()),
        fetch('http://localhost:8000/api/fixed-assets', { headers }).then(r => r.json()),
        fetch('http://localhost:8000/api/budgets', { headers }).then(r => r.json()),
        fetch('http://localhost:8000/api/dashboard/accounting', { headers }).then(r => r.json())
      ]);

      setData({
        accounts: Array.isArray(accounts) ? accounts : [],
        journals: Array.isArray(journals) ? journals : [],
        tiers: Array.isArray(tiers) ? tiers : [],
        invoices: Array.isArray(invoices) ? invoices : [],
        entries: Array.isArray(entries) ? entries : [],
        employees: Array.isArray(employees) ? employees : [],
        payslips: Array.isArray(payslips) ? payslips : [],
        fixed_assets: Array.isArray(fixedAssets) ? fixedAssets : [],
        budgets: Array.isArray(budgets) ? budgets : [],
        stats: (dashboard && typeof dashboard === 'object' && !dashboard.message) ? dashboard : { ca: 0, charges: 0, tvaCollectee: 0, tvaDeductible: 0, resultat: 0 }
      });
    } catch (err) {
      console.error("Error fetching ERP data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const refresh = () => fetchAll();

  return (
    <DataContext.Provider value={{ data, loading, refresh }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
