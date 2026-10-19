import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock } from 'lucide-react';
import { storageService } from '../lib/storageService';

export default function AuthLoginPage() {
  const { login, showToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleStandardSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      showToast('Account is temporarily locked due to multiple failed login attempts. (FR-AUTH-05)', 'danger');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const match = result.user;
      setFailedAttempts(0);
      showToast(`Welcome back, ${match.name}!`, 'success');
      if (match.role === 'DONOR') navigate('/donor/dashboard');
      else if (match.role === 'NGO') navigate('/ngo/discover');
      else if (match.role === 'VOLUNTEER') navigate('/volunteer/tasks');
      else if (match.role === 'ADMIN') navigate('/admin/overview');
      else navigate('/');
    } else {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      if (attempts >= 5) {
        setIsLocked(true);
        showToast('Account locked for 15 minutes after 5 failed login attempts (FR-AUTH-05)', 'danger');
      } else {
        showToast(result.error || `Invalid email or password. Attempt ${attempts} of 5.`, 'danger');
      }
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2.5rem auto 4rem', padding: '0 1rem' }}>
      <div className="card" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
            <Lock size={24} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Sign In</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
            Access your Food Rescue dashboard and operations
          </p>
        </div>

        {/* Lockout alert */}
        {isLocked && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '0.85rem', borderRadius: 'var(--radius-sm)', color: '#991B1B', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            🔒 <b>Account Locked:</b> Too many failed attempts. Please contact support or wait 15 minutes.
          </div>
        )}

        <form onSubmit={handleStandardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. contact@yourorganization.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/reset-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="form-input"
              style={{ marginTop: '0.4rem' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isLocked || loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Register Here</Link>
        </div>
      </div>
    </div>
  );
}
