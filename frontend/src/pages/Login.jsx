import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Identifiants incorrects');
      }
      
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '56px', height: '56px', background: 'var(--green)', borderRadius: '16px', 
            margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '28px',
            boxShadow: '0 8px 24px rgba(29,158,117,0.25)' 
          }}>C</div>
          <h2 style={{ marginBottom: '8px', fontSize: '24px' }}>ProCompta</h2>
          <p className="text-muted">ERP Comptable Marocain Intelligent</p>
        </div>

        {error && <div className="alert alert-red" style={{ marginBottom: '20px' }}><span>✕</span><span>{error}</span></div>}

        <form onSubmit={handleLogin} className="flex-c">
          <div className="form-group">
            <label className="form-label">Adresse Email</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="admin@procompta.ma"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Mot de passe
              <a href="#" style={{ color: 'var(--green)', textDecoration: 'none' }}>Oublié ?</a>
            </label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }} disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text2)' }}>
          Pas encore de compte ? <Link to="/register" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Créer un compte</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
