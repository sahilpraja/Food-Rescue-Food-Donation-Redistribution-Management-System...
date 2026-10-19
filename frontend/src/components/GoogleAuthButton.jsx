import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, X, Check, ExternalLink, Settings } from 'lucide-react';

export default function GoogleAuthButton({
  mode = 'login', // 'login' or 'register'
  selectedRole = 'DONOR',
  adminSecret = '',
  onSuccess,
  onError,
  disabled = false
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [customClientId, setCustomClientId] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoName, setDemoName] = useState('');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('foodrescue_google_client_id') || '';

  // Initialize official Google Identity Services if client ID exists
  useEffect(() => {
    if (!clientId || typeof window === 'undefined') return;

    const checkGoogleInterval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogleInterval);
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              try {
                // Decode Google JWT payload
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                onSuccess?.({
                  email: payload.email,
                  name: payload.name || payload.email.split('@')[0],
                  picture: payload.picture,
                  idToken: response.credential,
                  role: selectedRole,
                  adminSecret
                });
              } catch (err) {
                onError?.(err.message || 'Failed to parse Google credentials');
              }
            }
          });
        } catch (e) {
          console.warn('[GoogleAuth] GIS init notice:', e.message);
        }
      }
    }, 200);

    return () => clearInterval(checkGoogleInterval);
  }, [clientId, selectedRole, adminSecret, onSuccess, onError]);

  const handleClick = () => {
    if (disabled) return;

    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch (e) {
        console.warn('[GoogleAuth] prompt failed, opening modal:', e.message);
      }
    }
    // If no client ID configured yet or popup blocked, open interactive helper
    setModalOpen(true);
  };

  const handleSaveClientId = (e) => {
    e.preventDefault();
    if (customClientId.trim()) {
      localStorage.setItem('foodrescue_google_client_id', customClientId.trim());
      setModalOpen(false);
      window.location.reload();
    }
  };

  const handleSimulateGoogleLogin = (email, name) => {
    setModalOpen(false);
    onSuccess?.({
      email: email.trim(),
      name: name || email.split('@')[0],
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
      idToken: `simulated_google_token_${Date.now()}`,
      role: selectedRole,
      adminSecret
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="btn"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          background: '#FFFFFF',
          color: '#374151',
          border: '1.5px solid #D1D5DB',
          fontWeight: 600,
          fontSize: '0.925rem',
          padding: '0.65rem 1rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = '#9CA3AF';
            e.currentTarget.style.background = '#F9FAFB';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = '#D1D5DB';
            e.currentTarget.style.background = '#FFFFFF';
          }
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>
          {mode === 'login' ? 'Sign In with Google' : 'Sign Up with Google'}
        </span>
      </button>

      {/* Google Configuration & Quick Test Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Google Authentication</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B', marginBottom: '4px' }}>
                🚀 Instant Google Testing & Verification
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                Choose a Google profile below to test {mode === 'login' ? 'login' : 'registration'} immediately:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleSimulateGoogleLogin('sahil.donor@gmail.com', 'Sahil Prajapati')}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.8rem', justifyContent: 'flex-start', padding: '0.5rem 0.75rem' }}
                >
                  🟢 Donor: Sahil Prajapati
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateGoogleLogin('hope.ngo@gmail.com', 'Hope Shelter NGO')}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.8rem', justifyContent: 'flex-start', padding: '0.5rem 0.75rem' }}
                >
                  🔵 NGO: Hope Shelter
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateGoogleLogin('raj.courier@gmail.com', 'Raj Volunteer')}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.8rem', justifyContent: 'flex-start', padding: '0.5rem 0.75rem' }}
                >
                  🟠 Volunteer: Raj
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateGoogleLogin('admin.foodrescue@gmail.com', 'Super Admin')}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.8rem', justifyContent: 'flex-start', padding: '0.5rem 0.75rem' }}
                >
                  🟣 Platform Admin
                </button>
              </div>

              {/* Custom Google Account simulation */}
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #CBD5E1' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Or use custom Google account:</span>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="yourname@gmail.com"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    disabled={!demoEmail.includes('@')}
                    onClick={() => handleSimulateGoogleLogin(demoEmail, demoName || demoEmail.split('@')[0])}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>

            {/* Production Setup Instructions */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Settings size={15} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Configure Live Google OAuth Client ID</span>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '8px' }}>
                To connect real Google accounts on your live domain, obtain a free Web Client ID from{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                >
                  Google Cloud Console <ExternalLink size={11} />
                </a>{' '}
                and add your authorized JavaScript origins.
              </p>

              <form onSubmit={handleSaveClientId} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 123456789-xyz.apps.googleusercontent.com"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                  value={customClientId}
                  onChange={(e) => setCustomClientId(e.target.value)}
                />
                <button type="submit" className="btn btn-sm btn-secondary" style={{ flexShrink: 0 }}>
                  Save Key
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
