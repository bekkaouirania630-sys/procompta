import axiosInstance from '../services/api/axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Accounting ───────────────────────────────────────────────
export const useAccounts = () => useQuery({
  queryKey: ['accounts'],
  queryFn: () => axiosInstance.get('/accounting/accounts').then(r => r.data),
});

export const useJournals = () => useQuery({
  queryKey: ['journals'],
  queryFn: () => axiosInstance.get('/accounting/journals').then(r => r.data),
});

export const useEntries = () => useQuery({
  queryKey: ['entries'],
  queryFn: () => axiosInstance.get('/accounting/entries').then(r => r.data),
});

export const useCreateEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosInstance.post('/accounting/entries', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  });
};

export const useUpdateEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => axiosInstance.put(`/accounting/entries/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  });
};

export const useUpdateEntryStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => axiosInstance.patch(`/accounting/entries/${id}/status`, { status }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  });
};

export const useDeleteEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosInstance.delete(`/accounting/entries/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  });
};

export const useCreateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosInstance.post('/accounting/accounts', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
};

export const useUpdateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => axiosInstance.put(`/accounting/accounts/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
};

export const useDeleteAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosInstance.delete(`/accounting/accounts/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
};

// ─── Reporting ────────────────────────────────────────────────
export const useBalance = (startDate, endDate) => useQuery({
  queryKey: ['balance', startDate, endDate],
  queryFn: () => axiosInstance.get('/accounting/reports/balance', { params: { start_date: startDate, end_date: endDate } }).then(r => r.data),
  enabled: !!startDate && !!endDate,
});

export const useGrandLivre = (startDate, endDate) => useQuery({
  queryKey: ['grand-livre', startDate, endDate],
  queryFn: () => axiosInstance.get('/accounting/reports/grand-livre', { params: { start_date: startDate, end_date: endDate } }).then(r => r.data),
  enabled: !!startDate && !!endDate,
});

export const useBilan = (date) => useQuery({
  queryKey: ['bilan', date],
  queryFn: () => axiosInstance.get('/accounting/reports/bilan', { params: { date } }).then(r => r.data),
  enabled: !!date,
});

export const useTvaDeclaration = (month, year) => useQuery({
  queryKey: ['tva', month, year],
  queryFn: () => axiosInstance.get('/accounting/reports/tva', { params: { month, year } }).then(r => r.data),
});

export const useCnssDeclaration = (month, year) => useQuery({
  queryKey: ['cnss', month, year],
  queryFn: () => axiosInstance.get('/accounting/reports/cnss', { params: { month, year } }).then(r => r.data),
});
