import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import './Login.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors from Laravel
        if(typeof data === 'object' && !data.error) {
           throw new Error(Object.values(data).flat().join(', '));
        }
        throw new Error(data.error || 'Registration failed');
      }
      
      // Auto-login after register or redirect to login. Redirecting to login is simpler.
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="glass-panel login-card animate-fade-in" style={{ maxWidth: '480px' }}>
        <div className="login-header">
          <div className="brand-logo">
             <div className="logo-icon"></div>
          </div>
          <h2>Créer un compte</h2>
          <p>Rejoignez ProCompta ERP</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <label className="form-label">Nom complet</label>
            <div className="input-with-icon">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Adresse Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="email@votresociete.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4">
            S'inscrire <ArrowRight size={20} />
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-text-muted)' }}>
          Déjà un compte ? <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Se connecter</Link>
        </div>
      </div>
      
      <div className="login-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2" style={{ background: '#10B981' }}></div>
      </div>
    </div>
  );
};

export default Register;
