import axiosInstance from '../services/api/axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Products ─────────────────────────────────────────────────
export const useProducts = () => useQuery({
  queryKey: ['products'],
  queryFn: () => axiosInstance.get('/products').then(r => r.data),
});

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosInstance.post('/products', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => axiosInstance.put(`/products/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosInstance.delete(`/products/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

// ─── Stock Movements ──────────────────────────────────────────
export const useStockMovements = (productId) => useQuery({
  queryKey: ['stock-movements', productId],
  queryFn: () => axiosInstance.get(`/stock-movements`, { params: { product_id: productId } }).then(r => r.data),
  enabled: !!productId,
});

export const useCreateStockMovement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosInstance.post('/stock-movements', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['stock-movements'] });
    },
  });
};

// ─── Bank ─────────────────────────────────────────────────────
export const useBankAccounts = () => useQuery({
  queryKey: ['bank-accounts'],
  queryFn: () => axiosInstance.get('/bank-accounts/summary').then(r => r.data),
});

export const useBankTransactions = (accountId) => useQuery({
  queryKey: ['bank-transactions', accountId],
  queryFn: () => axiosInstance.get(`/bank-accounts/${accountId}/transactions`).then(r => r.data),
  enabled: !!accountId,
});

// ─── HR ───────────────────────────────────────────────────────
export const useEmployees = () => useQuery({
  queryKey: ['employees'],
  queryFn: () => axiosInstance.get('/employees').then(r => r.data),
});

export const useCreateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosInstance.post('/employees', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => axiosInstance.put(`/employees/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

export const useDeleteEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosInstance.delete(`/employees/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

export const usePayslips = () => useQuery({
  queryKey: ['payslips'],
  queryFn: () => axiosInstance.get('/payslips').then(r => r.data),
});

export const useGeneratePayslips = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosInstance.post('/payslips/generate', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payslips'] }),
  });
};

export const useValidatePayslip = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosInstance.patch(`/payslips/${id}/status`, { status: 'validé' }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payslips'] }),
  });
};

// ─── Dashboard ────────────────────────────────────────────────
export const useDashboardStats = () => useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: () => axiosInstance.get('/dashboard/accounting').then(r => r.data),
});

// ─── Notifications ────────────────────────────────────────────
export const useNotifications = () => useQuery({
  queryKey: ['notifications'],
  queryFn: () => axiosInstance.get('/notifications').then(r => r.data),
  refetchInterval: 60000,
});
