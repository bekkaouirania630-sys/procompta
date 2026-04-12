import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/api/axiosInstance';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.data || []);
      } catch (e) {
        console.error("Search error", e);
      } finally {
        setLoading(false);
      }
    };
    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    navigate(item.url);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '300px' }} className="hidden md:block">
      <div 
        className={`flex items-center gap-2 px-4 py-2 bg-surface-mut border transition-all ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-border-light hover:border-gray-400'}`}
        style={{ borderRadius: '100px' }}
      >
        <Search size={16} className="text-muted" />
        <input 
          type="text" 
          className="bg-transparent border-none outline-none flex-1 text-sm text-main"
          placeholder="Rechercher facture, client, compte..." 
          value={query}
          onChange={(e) => {
             setQuery(e.target.value);
             setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button onClick={() => { setQuery(''); setIsOpen(false); }} className="text-muted hover:text-main">
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div 
          className="absolute top-full mt-2 w-full glass-panel" 
          style={{ 
            background: 'var(--surface-real)', 
            border: '1px solid var(--border)',
            padding: '12px',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lux)',
            zIndex: 100,
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2 px-2">Résultats</div>
              {results.map((item, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSelect(item)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-mut transition text-left group"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-main">{item.title}</span>
                    <span className="text-[11px] text-muted">{item.subtitle}</span>
                  </div>
                  <ArrowRight size={14} className="text-muted opacity-0 group-hover:opacity-100 group-hover:text-primary transition" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted">
              Aucun résultat pour "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
