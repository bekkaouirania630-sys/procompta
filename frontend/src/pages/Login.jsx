import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, BarChart3 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCompanyStore from '../store/useCompanyStore';
import axiosInstance from '../services/api/axiosInstance';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const setCompany = useCompanyStore(state => state.setCompany);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/login', { email, password });
      // Store auth in Zustand (also persists to localStorage via middleware)
      setAuth(data.user, data.token);
      // Store company if available
      if (data.user?.company_id) {
        setCompany(data.user.company_id, data.user?.company || null);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Identifiants incorrects');
    }
    setLoading(false);
  };

  return (
    <div className="login-root">
      {/* Left panel – branding */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-brand">
            <div className="login-brand-icon">
              <BarChart3 size={28} strokeWidth={2} />
            </div>
            <div>
              <div className="login-brand-name">ProCompta</div>
              <div className="login-brand-tagline">ERP Comptable Marocain</div>
            </div>
          </div>

          <div className="login-hero">
            <h1 className="login-hero-title">
              La comptabilité marocaine,<br />
              <span className="login-hero-accent">réinventée.</span>
            </h1>
            <p className="login-hero-desc">
              Gérez votre Plan Comptable Marocain, vos journaux, factures, 
              déclarations TVA et bien plus — dans un seul espace intelligent.
            </p>
          </div>

          <div className="login-features">
            {[
              { icon: '◈', text: 'Plan Comptable PCM conforme' },
              { icon: '◈', text: 'Saisie comptable intelligente' },
              { icon: '◈', text: 'OCR & import automatisé' },
              { icon: '◈', text: 'Fiscalité TVA & déclarations' },
            ].map((f, i) => (
              <div key={i} className="login-feature-item">
                <span className="login-feature-dot">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <div className="login-footer-note">
            © 2026 ProCompta · Tous droits réservés
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Connexion</h2>
            <p className="login-card-sub">Accédez à votre espace comptable</p>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Adresse Email</label>
              <div className="login-input-wrap">
                <Mail size={15} className="login-input-icon" />
                <input
                  type="email"
                  className="form-input login-padded-input"
                  placeholder="admin@procompta.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="login-email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Mot de passe</span>
                <a href="#" className="login-forgot">Mot de passe oublié ?</a>
              </label>
              <div className="login-input-wrap">
                <Lock size={15} className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input login-padded-input login-padded-right"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  id="login-password"
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <>
                  <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="login-register">
            Pas encore de compte ?{' '}
            <Link to="/register" className="login-register-link">Créer un compte</Link>
          </div>
        </div>
      </div>

      <style>{`
        .login-root {
          display: flex;
          height: 100vh;
          background: #F4F5F7;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ── Left branding panel ── */
        .login-left {
          flex: 1;
          background: linear-gradient(145deg, #0C0E12 0%, #111620 50%, #0a1a10 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          top: -30%;
          right: -20%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(5,150,105,0.2) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-left::after {
          content: '';
          position: absolute;
          bottom: -20%;
          left: -10%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-left-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 40px;
          max-width: 440px;
          width: 100%;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .login-brand-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #059669 0%, #10B981 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 8px 24px rgba(5,150,105,0.4);
          flex-shrink: 0;
        }

        .login-brand-name {
          color: #F0F2F5;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .login-brand-tagline {
          color: rgba(255,255,255,0.35);
          font-size: 12px;
          font-weight: 500;
          margin-top: 2px;
        }

        .login-hero-title {
          font-size: 36px;
          font-weight: 800;
          color: #F0F2F5;
          letter-spacing: -0.04em;
          line-height: 1.15;
          margin: 0;
        }

        .login-hero-accent {
          background: linear-gradient(90deg, #34D399 0%, #10B981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-hero-desc {
          color: rgba(255,255,255,0.45);
          font-size: 14px;
          line-height: 1.7;
          margin-top: 14px;
          font-weight: 400;
        }

        .login-features {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .login-feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,0.55);
          font-size: 13px;
          font-weight: 500;
        }

        .login-feature-dot {
          color: #34D399;
          font-size: 10px;
          flex-shrink: 0;
        }

        .login-footer-note {
          color: rgba(255,255,255,0.2);
          font-size: 11px;
          font-weight: 500;
        }

        /* ── Right form panel ── */
        .login-right {
          width: 480px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          background: #F4F5F7;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          background: #fff;
          border: 1px solid #E4E5E7;
          border-radius: 20px;
          padding: 36px 32px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
        }

        .login-card-header { margin-bottom: 28px; }
        .login-card-title {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0F1014;
          margin: 0 0 6px;
        }
        .login-card-sub {
          font-size: 13px;
          color: #9EA3AD;
          font-weight: 500;
        }

        .login-error {
          background: #FEE2E2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px;
          font-weight: 500;
          color: #991B1B;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-input-icon {
          position: absolute;
          left: 12px;
          color: #9EA3AD;
          pointer-events: none;
          flex-shrink: 0;
        }

        .login-padded-input { padding-left: 36px !important; }
        .login-padded-right { padding-right: 40px !important; }

        .login-eye {
          position: absolute;
          right: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #9EA3AD;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .login-eye:hover { color: #52555E; }

        .login-forgot {
          color: #059669;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
        }
        .login-forgot:hover { color: #065F46; }

        .login-submit-btn {
          width: 100%;
          padding: 12px 20px;
          font-size: 14px;
          border-radius: 12px;
          margin-top: 4px;
          justify-content: center;
          gap: 8px;
        }

        .login-register {
          text-align: center;
          margin-top: 22px;
          font-size: 13px;
          color: #9EA3AD;
          font-weight: 500;
        }

        .login-register-link {
          color: #059669;
          font-weight: 700;
          text-decoration: none;
        }
        .login-register-link:hover { color: #065F46; }

        @media (max-width: 820px) {
          .login-left { display: none; }
          .login-right { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Login;
