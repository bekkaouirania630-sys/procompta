import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Package, Plus, ArrowDownCircle, ArrowUpCircle,
  Search, AlertTriangle, TrendingUp, Archive, X, Check
} from 'lucide-react';

const API = 'http://localhost:8000/api';

const Stock = () => {
  const { data, refresh } = useData();
  const [showModal, setShowModal] = useState(false);
  const [showMvtModal, setShowMvtModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ code: '', name: '', description: '', category: '', unit: 'unité', min_stock: 0, sku: '' });
  const [mvtForm, setMvtForm] = useState({ type: 'in', quantity: '', unit_price: '', reference: '', description: '' });

  const products = (data?.products || []).filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase())
  );

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API}/products`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(form) });
      setShowModal(false);
      setForm({ code: '', name: '', description: '', category: '', unit: 'unité', min_stock: 0, sku: '' });
      refresh();
    } catch (err) { console.error(err); }
  };

  const handleCreateMovement = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API}/stock-movements`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...mvtForm, product_id: selectedProduct?.id })
      });
      setShowMvtModal(false);
      setMvtForm({ type: 'in', quantity: '', unit_price: '', reference: '', description: '' });
      refresh();
    } catch (err) { console.error(err); }
  };

  const totalProducts = products.length;
  const lowStock = products.filter(p => (p.stock || 0) <= (p.min_stock || 0) && (p.min_stock || 0) > 0).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 className="premium-font" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            <Package style={{ display: 'inline', marginRight: 10, color: 'var(--primary)' }} size={28} />
            Gestion de Stock
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Produits, inventaire et mouvements</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nouveau Produit
        </button>
      </div>

      {/* KPIs */}
      <div className="grid g3" style={{ marginBottom: 32 }}>
        <div className="kpi-jewel">
          <div className="kpi-label">Total Produits</div>
          <div className="kpi-value">{totalProducts}</div>
        </div>
        <div className="kpi-jewel">
          <div className="kpi-label" style={{ color: 'var(--danger)' }}>
            <AlertTriangle size={14} style={{ display: 'inline', marginRight: 4 }} />
            Stock Bas
          </div>
          <div className="kpi-value" style={{ color: 'var(--danger)' }}>{lowStock}</div>
        </div>
        <div className="kpi-jewel">
          <div className="kpi-label">Valeur Estimée</div>
          <div className="kpi-value num-font">—</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <div className="tb-search" style={{ maxWidth: 400 }}>
          <Search size={16} style={{ color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="tb-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-premium-responsive">
        <table className="tbl-premium">
          <thead>
            <tr>
              <th>Code</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Unité</th>
              <th>Stock Actuel</th>
              <th>Stock Min</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
                  <Archive size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                  <div>Aucun produit enregistré</div>
                </td>
              </tr>
            ) : (
              products.map(p => {
                const stock = p.stock || 0;
                const isLow = stock <= (p.min_stock || 0) && (p.min_stock || 0) > 0;
                return (
                  <tr key={p.id}>
                    <td><span className="num-font" style={{ fontWeight: 700 }}>{p.code}</span></td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.category || '—'}</td>
                    <td>{p.unit}</td>
                    <td><span className="num-font" style={{ fontWeight: 700, color: isLow ? 'var(--danger)' : 'var(--text-main)' }}>{stock}</span></td>
                    <td className="num-font">{p.min_stock || 0}</td>
                    <td>
                      {isLow ? (
                        <span className="badge badge-danger">Stock Bas</span>
                      ) : (
                        <span className="badge badge-success">Normal</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '6px 10px', fontSize: 11 }}
                          onClick={() => { setSelectedProduct(p); setMvtForm({ ...mvtForm, type: 'in' }); setShowMvtModal(true); }}
                        >
                          <ArrowDownCircle size={14} /> Entrée
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '6px 10px', fontSize: 11, borderColor: 'rgba(239,68,68,0.3)', color: 'var(--danger)' }}
                          onClick={() => { setSelectedProduct(p); setMvtForm({ ...mvtForm, type: 'out' }); setShowMvtModal(true); }}
                        >
                          <ArrowUpCircle size={14} /> Sortie
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal: New Product ── */}
      {showModal && (
        <div className="modal-overlay-premium" onClick={() => setShowModal(false)}>
          <div className="modal-card-premium" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-light)' }}>
              <h2 className="premium-font" style={{ fontSize: 20, fontWeight: 800 }}>Nouveau Produit</h2>
            </div>
            <form onSubmit={handleCreateProduct} style={{ padding: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Code *</label>
                  <input className="premium-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">Nom *</label>
                  <input className="premium-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">Catégorie</label>
                  <input className="premium-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">Unité</label>
                  <select className="premium-input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    <option value="unité">Unité</option>
                    <option value="kg">Kg</option>
                    <option value="litre">Litre</option>
                    <option value="mètre">Mètre</option>
                    <option value="boîte">Boîte</option>
                  </select>
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">Stock Minimum</label>
                  <input className="premium-input" type="number" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} />
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">SKU</label>
                  <input className="premium-input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                </div>
              </div>
              <div className="premium-form-group" style={{ marginTop: 8 }}>
                <label className="premium-label">Description</label>
                <textarea className="premium-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary"><Check size={16} /> Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Stock Movement ── */}
      {showMvtModal && selectedProduct && (
        <div className="modal-overlay-premium" onClick={() => setShowMvtModal(false)}>
          <div className="modal-card-premium" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-light)' }}>
              <h2 className="premium-font" style={{ fontSize: 20, fontWeight: 800 }}>
                {mvtForm.type === 'in' ? (
                  <><ArrowDownCircle size={20} style={{ color: 'var(--success)', marginRight: 8, display: 'inline' }} />Entrée Stock</>
                ) : (
                  <><ArrowUpCircle size={20} style={{ color: 'var(--danger)', marginRight: 8, display: 'inline' }} />Sortie Stock</>
                )}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Produit : <strong>{selectedProduct.name}</strong> ({selectedProduct.code})</p>
            </div>
            <form onSubmit={handleCreateMovement} style={{ padding: 28 }}>
              <div className="premium-form-group">
                <label className="premium-label">Quantité *</label>
                <input className="premium-input" type="number" step="0.01" min="0.01" value={mvtForm.quantity} onChange={e => setMvtForm({ ...mvtForm, quantity: e.target.value })} required />
              </div>
              {mvtForm.type === 'in' && (
                <div className="premium-form-group">
                  <label className="premium-label">Prix Unitaire (MAD)</label>
                  <input className="premium-input" type="number" step="0.01" value={mvtForm.unit_price} onChange={e => setMvtForm({ ...mvtForm, unit_price: e.target.value })} />
                </div>
              )}
              <div className="premium-form-group">
                <label className="premium-label">Référence</label>
                <input className="premium-input" value={mvtForm.reference} onChange={e => setMvtForm({ ...mvtForm, reference: e.target.value })} placeholder="Ex: BL-2026-001" />
              </div>
              <div className="premium-form-group">
                <label className="premium-label">Motif / Description</label>
                <textarea className="premium-input" rows={2} value={mvtForm.description} onChange={e => setMvtForm({ ...mvtForm, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowMvtModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> Valider {mvtForm.type === 'in' ? "l'Entrée" : 'la Sortie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
