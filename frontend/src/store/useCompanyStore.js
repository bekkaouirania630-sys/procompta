import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCompanyStore = create(
  persist(
    (set) => ({
      currentCompanyId: localStorage.getItem('company_id') || null,
      currentCompany: null,
      
      setCompany: (companyId, company = null) => {
        set({ currentCompanyId: companyId, currentCompany: company });
        localStorage.setItem('company_id', companyId);
        // Trigger a custom event for legacy components if needed
        window.dispatchEvent(new Event('company-changed'));
      },
      
      clearCompany: () => {
        set({ currentCompanyId: null, currentCompany: null });
        localStorage.removeItem('company_id');
      },
    }),
    {
      name: 'procompta-company',
      getStorage: () => localStorage,
    }
  )
);

export default useCompanyStore;
