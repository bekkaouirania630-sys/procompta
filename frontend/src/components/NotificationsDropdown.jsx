import React, { useRef, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Calculator, Info, X } from 'lucide-react';
import { useNotifications } from '../hooks/useModules';
import { formatDateTime } from '../utils/formatters';

const NotifIcon = ({ type }) => {
  const props = { size: 14 };
  if (type === 'Paiement en retard') return <AlertTriangle {...props} className="text-amber-500" />;
  if (type === 'Échéance TVA') return <Calculator {...props} className="text-blue-500" />;
  return <Info {...props} className="text-emerald-500" />;
};

const NotificationsDropdown = ({ open, onClose }) => {
  const { data, isLoading } = useNotifications();
  const ref = useRef(null);

  const notifications = data?.notifications || [];
  const count = data?.count || 0;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
      style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-slate-800 premium-font">Notifications</span>
          {count > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <X size={14} className="text-slate-400" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-slate-400 text-sm">Chargement...</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <CheckCircle size={32} className="text-emerald-300 mb-3" />
            <p className="text-sm font-semibold">Aucune notification</p>
            <p className="text-xs text-slate-300 mt-1">Tout est à jour ✓</p>
          </div>
        ) : (
          notifications.map((notif, i) => (
            <div
              key={notif.id || i}
              className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <NotifIcon type={notif.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{notif.type}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                {notif.created_at && (
                  <p className="text-[10px] text-slate-300 mt-1 font-mono">{formatDateTime(notif.created_at)}</p>
                )}
              </div>
              {!notif.is_read && (
                <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
          Voir toutes les notifications →
        </button>
      </div>
    </div>
  );
};

export default NotificationsDropdown;
