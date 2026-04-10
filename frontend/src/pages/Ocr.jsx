import React, { useState } from 'react';

export default function Ocr() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    setFile(file);
    setProcessing(true);
    setResult(null);

    // Mock OCR processing time
    setTimeout(() => {
      setProcessing(false);
      setResult({
        fournisseur: "Maroc Telecom",
        date: "2024-06-03",
        ttc: 3840.00,
        tva: 640.00,
        ht: 3200.00,
        numero: "FA-2024-090"
      });
    }, 2500);
  };

  const fmt = (n) => Number(n).toLocaleString('fr-MA', { minimumFractionDigits: 2 });

  return (
    <>
      <div className="section-header">
        <h2 style={{ marginBottom: 0 }}>Import & Traitement OCR</h2>
        {result && <button className="btn btn-primary">Valider l'extraction</button>}
      </div>

      <div className="grid g21">
        <div className="flex-c">
          <div className="card">
            <h3>Importer un document</h3>
            <p className="text-muted" style={{ marginBottom: '16px', fontSize: '13px' }}>
              Glissez et déposez une facture (PDF, JPG, PNG) ou cliquez pour parcourir.
            </p>
            <div 
              className={`drop-zone ${dragActive ? 'drag' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('ocr-upload').click()}
            >
              <input 
                type="file" 
                id="ocr-upload" 
                style={{ display: 'none' }} 
                accept=".pdf,.png,.jpg,.jpeg" 
                onChange={handleChange}
              />
              {!file ? (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                  <div className="fw6">Cliquez ou déposez votre fichier ici</div>
                  <div className="text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>Taille max : 5 MB</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
                  <div className="fw6 text-green">{file.name}</div>
                  <div className="text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              )}
            </div>

            {processing && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span className="fw6 text-blue">Analyse par Intelligence Artificielle...</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          {result && !processing && (
            <div className="card" style={{ borderLeft: '3px solid var(--green)' }}>
              <h3>Données Extraités</h3>
              <div className="alert alert-green" style={{ marginBottom: '16px' }}>
                ✓ Extraction Réussie avec 98% de confiance.
              </div>

              <div className="grid g2" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Fournisseur</label>
                  <input className="form-input" defaultValue={result.fournisseur} />
                </div>
                <div className="form-group">
                  <label className="form-label">N° Facture</label>
                  <input className="form-input" defaultValue={result.numero} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" defaultValue={result.date} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total HT (MAD)</label>
                  <input className="form-input" defaultValue={result.ht} />
                </div>
                <div className="form-group">
                  <label className="form-label">TVA (MAD)</label>
                  <input className="form-input" defaultValue={result.tva} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total TTC (MAD)</label>
                  <input className="form-input fw6" defaultValue={result.ttc} style={{ color: 'var(--blue-dark)', backgroundColor: 'var(--blue-light)' }} />
                </div>
              </div>

              <button className="btn btn-outline" style={{ marginTop: '20px', width: '100%' }}>
                Recommencer avec un autre fichier
              </button>
            </div>
          )}

          {!result && !processing && (
            <div className="card empty">
              <div className="empty-icon">🔍</div>
              <p>Aucun résultat. Importez un document pour extraire les données de facturation.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
