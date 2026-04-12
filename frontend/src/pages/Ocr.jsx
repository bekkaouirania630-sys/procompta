import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import {
  ScanLine, Upload, FileText, CheckCircle, AlertTriangle,
  Loader2, Trash2, Eye, ArrowRight, Zap, Check, X,
  ExternalLink, Calculator, Building2, Calendar, Sparkles, Wand2,
  Database, ShieldCheck, History as HistoryIcon
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist';

// Remove top-level side effects. Worker will be configured inside the component.

const API = 'http://localhost:8000/api';

const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Accept': 'application/json',
});

const fmt = (n) => parseFloat(n || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 });

export default function Ocr() {
  const { data, refresh } = useData();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verifying, setVerifying] = useState(false);
  
  // OCR specific states
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [rawText, setRawText] = useState('');

  const fetchDocs = async () => {
    try {
      const res = await fetch(`${API}/ocr/documents`, { headers: getHeaders() });
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.data || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
    // Dynamic import of worker to ensure it only loads inside the component
    const setupWorker = async () => {
        const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
        pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
    };
    setupWorker();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleProcessFile(e.dataTransfer.files[0]);
  };

  const handleProcessFile = async (file) => {
    setUploading(true);
    setOcrStatus('Téléchargement du document...');
    setOcrProgress(10);

    // 1. Upload to server first to get an ID
    const formData = new FormData();
    formData.append('file', file);
    const uploadRes = await fetch(`${API}/ocr/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
    });
    if (!uploadRes.ok) { setUploading(false); return; }
    const { document: doc } = await uploadRes.json();
    
    setOcrStatus('Extraction cognitive en cours...');
    setOcrProgress(30);

    try {
        let textResult = '';

        if (file.type === 'application/pdf') {
            setOcrStatus('Conversion PDF en image...');
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1); // Process first page
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            
            setOcrStatus('Lecture des caractères (OCR)...');
            textResult = await runOCR(canvas.toDataURL('image/jpeg'));
        } else {
            setOcrStatus('Analyse de l\'image...');
            textResult = await runOCR(file);
        }

        setRawText(textResult);
        setOcrProgress(80);
        setOcrStatus('Analyse sémantique (IA)...');

        // 3. Send text to backend for Intelligence
        const analyzeRes = await fetch(`${API}/ocr/analyze`, {
            method: 'POST',
            headers: { ...getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ document_id: doc.id, raw_text: textResult })
        });

        if (analyzeRes.ok) {
            const resultJson = await analyzeRes.json();
            setSelectedDoc({ ...doc, ocr_result: resultJson.ocr_result });
            fetchDocs();
        }
    } catch (e) { console.error("OCR Error:", e); }
    
    setOcrProgress(100);
    setTimeout(() => {
        setUploading(false);
        setOcrProgress(0);
        setOcrStatus('');
    }, 500);
  };

  const runOCR = async (source) => {
    const worker = await createWorker('fra');
    const { data: { text } } = await worker.recognize(source);
    await worker.terminate();
    return text;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    await fetch(`${API}/ocr/documents/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (selectedDoc?.id === id) setSelectedDoc(null);
    fetchDocs();
  };

  const handleCreateEntry = async () => {
    if (!selectedDoc || !selectedDoc.ocr_result) return;
    setVerifying(true);
    const ext = selectedDoc.ocr_result.extracted_data;

    const achJournal = data.journals.find(j => j.code === 'ACH') || data.journals[0];
    const vendorAccount = data.accounts.find(a => String(a.id) === String(ext.suggested_account)) || { id: 11 };

    const payload = {
      date: ext.date,
      description: `Facture OCR: ${ext.vendor_name} (${ext.invoice_number})`,
      journal_id: achJournal.id,
      status: 'brouillon',
      lines: [
        { account_id: 25, label: ext.vendor_name, debit: ext.amount_ht, credit: 0 },
        { account_id: vendorAccount.id, label: ext.vendor_name, debit: 0, credit: ext.amount_ttc },
        { account_id: 11, label: 'TVA Récupérable', debit: ext.amount_tva, credit: 0 },
      ].filter(l => l.debit > 0 || l.credit > 0)
    };

    try {
      const res = await fetch(`${API}/accounting/entries`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Ecriture comptable générée avec succès !");
        setSelectedDoc(null);
        refresh();
      }
    } catch (e) { console.error(e); }
    setVerifying(false);
  };

  const ocrRes = selectedDoc?.ocr_result?.extracted_data;

  return (
    <div className="fade-in">
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Intelligence OCR Cognitive</h2>
          <p className="text-muted" style={{ fontWeight: 500 }}>Traitement haute précision (Images & PDF) avec détection fiscale marocaine.</p>
        </div>
        <div className="flex gap-2">
            <span className="badge badge-success" style={{ padding: '8px 16px' }}><Wand2 size={12} style={{ marginRight: 8 }}/> Tesseract v5 Multi-format</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 mt-8">
        <div className="col-span-4 flex flex-col gap-6">
          <div 
            className={`card glass-panel text-center border-2 border-dashed transition-all cursor-pointer
              ${dragActive ? 'border-primary bg-primary-glow scale-[1.02]' : 'border-border-light hover:border-primary'}
              ${uploading ? 'pointer-events-none' : ''}`}
            style={{ padding: '48px 24px', height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => !uploading && document.getElementById('ocr-file').click()}
          >
            <input type="file" id="ocr-file" hidden onChange={e => handleProcessFile(e.target.files[0])} accept="image/*,application/pdf" />
            
            {uploading ? (
              <div className="flex flex-col items-center gap-6 animate-pulse">
                <div style={{ position: 'relative' }}>
                    <Loader2 className="animate-spin text-primary" size={64} strokeWidth={1} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>{ocrProgress}%</div>
                </div>
                <div className="flex-c gap-1">
                    <div className="premium-font" style={{ fontWeight: 800 }}>{ocrStatus}</div>
                    <div className="text-muted" style={{ fontSize: '10px' }}>Ne fermez pas cette fenêtre...</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-primary-glow flex items-center justify-center text-primary shadow-lg border border-primary/10">
                  <ScanLine size={36} />
                </div>
                <div>
                    <div className="premium-font" style={{ fontWeight: 800, fontSize: '18px' }}>Convertir en Document</div>
                    <p className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>PDF Facture, Scan JPG, Reçus PNG</p>
                </div>
                <button className="btn btn-primary btn-sm mt-2 px-8">Analyser</button>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex items-center gap-2">
                <Database size={14} className="text-muted" />
                <span className="premium-font" style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>File d'attente</span>
              </div>
              <span className="badge badge-gray">{documents.length}</span>
            </div>
            <div style={{ maxHeight: '440px', overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: 60, textAlign: 'center' }}><Loader2 className="animate-spin mx-auto text-dim" /></div>
              ) : documents.map(doc => (
                <div key={doc.id} onClick={() => setSelectedDoc(doc)} className={`hover:bg-bg ${selectedDoc?.id === doc.id ? 'bg-bg' : ''}`}
                  style={{ padding: '16px 20px', borderBottom: '1px solid var(--surface-mut)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className={`p-2 rounded-xl ${doc.status === 'analysé' ? 'bg-primary-glow text-primary' : 'bg-warning/10 text-warning'}`}>
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.ocr_result?.extracted_data?.vendor_name || 'Scan en cours...'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{new Date(doc.created_at).toLocaleString()}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '12px' }}>{fmt(doc.ocr_result?.extracted_data?.amount_ttc)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-8">
          {!selectedDoc ? (
            <div className="card h-full min-h-[600px] flex flex-col items-center justify-center text-center gap-8" style={{ background: 'transparent', borderStyle: 'dashed' }}>
              <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center animate-pulse">
                <Sparkles size={64} strokeWidth={1} style={{ opacity: 0.1, color: 'var(--primary)' }} />
              </div>
              <div style={{ maxWidth: '350px' }}>
                <h3 className="premium-font" style={{ fontWeight: 800, fontSize: '22px', marginBottom: '12px' }}>Plateforme d'Analyse</h3>
                <p className="text-muted" style={{ fontSize: '14px' }}>Déposez un PDF ou une image de facture. Notre IA extraira automatiquement les montants, les taxes et les identifiants fiscaux.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 zoom-in">
              <div className="card glass-panel" style={{ padding: '32px' }}>
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="premium-font" style={{ margin: 0, fontSize: '24px' }}>{ocrRes.vendor_name}</h2>
                        {ocrRes.is_new_vendor && <span className="badge badge-warning">NOUVEAU FOURNISSEUR</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle size={12} className="text-success" />
                        <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>Extrait via Moteur Cognitif (Confiance 98%)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="tb-icon-btn" onClick={() => setSelectedDoc(null)}><X size={18}/></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="flex-c gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="premium-font" style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: 1 }}>Données Fiscales</span>
                            <div className="h-[1px] flex-1 bg-border-light"></div>
                        </div>
                        <div className="grid g2">
                            <div className="form-group">
                                <label className="form-label">ICE (Maroc)</label>
                                <div className="p-3 font-bold text-sm bg-surface-mut rounded-xl border border-white/5">{ocrRes.vendor_ice || 'Inconnu'}</div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">N° Facture</label>
                                <div className="p-3 font-bold text-sm bg-surface-mut rounded-xl border border-white/5">{ocrRes.invoice_number || 'ND'}</div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">I.F.</label>
                                <div className="p-3 font-bold text-sm bg-surface-mut rounded-xl border border-white/5">{ocrRes.vendor_if || '—'}</div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <div className="p-3 font-bold text-sm bg-surface-mut rounded-xl border border-white/5">{ocrRes.date}</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="premium-font" style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--secondary)', letterSpacing: 1 }}>Synthèse Financière</span>
                            <div className="h-[1px] flex-1 bg-border-light"></div>
                        </div>
                        <div className="p-6 rounded-2xl bg-bg border border-white/5 grid g3 text-center">
                            <div className="flex-c gap-1">
                                <span className="text-xs text-muted font-bold">MONTANT H.T</span>
                                <span style={{ fontSize: '18px', fontWeight: 800 }}>{fmt(ocrRes.amount_ht)}</span>
                            </div>
                            <div className="flex-c gap-1 border-x border-white/5">
                                <span className="text-xs text-muted font-bold">TVA ({ocrRes.tva_rate}%)</span>
                                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--secondary)' }}>{fmt(ocrRes.amount_tva)}</span>
                            </div>
                            <div className="flex-c gap-1">
                                <span className="text-xs text-muted font-bold">TOTAL T.T.C</span>
                                <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--primary)' }}>{fmt(ocrRes.amount_ttc)}</span>
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <span className="premium-font" style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: 1 }}>Texte Brut Extrait</span>
                        <Zap size={14} className="text-accent" />
                      </div>
                      <div className="flex-1 p-4 rounded-2xl bg-black/40 border border-white/5 text-[10px] font-mono text-muted overflow-y-auto leading-relaxed" style={{ maxHeight: '350px' }}>
                          <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedDoc.ocr_result?.raw_text || 'Analyse sémantique en cours...'}</pre>
                      </div>
                  </div>
                </div>

                <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-secondary-glow text-secondary"><Calculator size={18}/></div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Détection Multi-sources : <span className="text-main font-bold">Journal ACH ({ocrRes.suggested_account})</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="btn btn-outline" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(selectedDoc.id)}><Trash2 size={18}/></button>
                        <button className="btn btn-primary px-10" onClick={handleCreateEntry} disabled={verifying}>
                            {verifying ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>}
                            {verifying ? 'Génération...' : 'Valider dans le Journal'}
                        </button>
                    </div>
                </div>
              </div>
              
              {ocrRes.is_new_vendor && (
                <div className="alert alert-blue glass-panel" style={{ borderLeft: '4px solid var(--warning)' }}>
                   <Building2 size={20} className="text-warning" />
                   <div style={{ fontSize: '14px', flex: 1 }}>
                        <strong>Nouveau fournisseur détecté !</strong> Notre IA a créé automatiquement une fiche pour <strong>{ocrRes.vendor_name}</strong> en mode brouillon. Pensez à la valider dans le Plan Tiers.
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
