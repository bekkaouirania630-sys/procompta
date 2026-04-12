import axiosInstance from '../services/api/axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Invoices ─────────────────────────────────────────────────
export const useInvoices = () => useQuery({
  queryKey: ['invoices'],
  queryFn: () => axiosInstance.get('/invoices').then(r => r.data),
});

export const useCreateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosInstance.post('/invoices', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
};

export const useConvertQuote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quoteId) => axiosInstance.post(`/invoices/${quoteId}/convert`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
};

// ─── Tiers (Clients / Fournisseurs) ──────────────────────────
export const useTiers = () => useQuery({
  queryKey: ['tiers'],
  queryFn: () => axiosInstance.get('/tiers').then(r => r.data),
});

export const useCreateTier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosInstance.post('/tiers', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tiers'] }),
  });
};
