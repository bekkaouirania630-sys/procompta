// ─── Currency & Number Formatters ─────────────────────────────
export const formatMAD = (n) =>
  Number(n || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';

export const formatNumber = (n, decimals = 2) =>
  Number(n || 0).toLocaleString('fr-MA', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const formatPercent = (n) => `${Number(n || 0).toFixed(1)}%`;

// ─── Date Formatters ──────────────────────────────────────────
export const formatDate = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleString('fr-MA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ─── Status helpers ───────────────────────────────────────────
export const invoiceStatusLabel = {
  draft: 'Brouillon',
  pending: 'En attente',
  paid: 'Payée',
  overdue: 'En retard',
  converted: 'Convertie',
};

export const invoiceStatusVariant = {
  draft: 'neutral',
  pending: 'warning',
  paid: 'success',
  overdue: 'danger',
  converted: 'info',
};

export const leaveStatusLabel = {
  en_attente: 'En attente',
  approuve: 'Approuvé',
  rejete: 'Rejeté',
};

export const leaveStatusVariant = {
  en_attente: 'warning',
  approuve: 'success',
  rejete: 'danger',
};
