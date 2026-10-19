import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { KeyRound, ArrowRight, CheckCircle2, ShieldCheck, Mail, Lock, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const { forgotPassword, resetPassword, showToast } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError('');
    setLoading(true);
    const res = await forgotPassword(email.trim());
    setLoading(false);

    if (res.success) {
      if (res.simulatedOtp) {
        setSimulatedOtp(res.simulatedOtp);
        setOtp(res.simulatedOtp); // Pre-fill for convenience
      }
      setStep(2);
      showToast(`Verification code generated for ${email}`, 'info');
    } else {
      setError(res.error || 'Failed to request reset OTP. Check that the email is registered.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit verification OTP.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email.trim(), otp.trim(), newPassword);
    setLoading(false);

    if (res.success) {
      setStep(3);
      showToast('Password reset successfully! You can now log in.', 'success');
    } else {
      setError(res.error || 'Failed to reset password. Please check your verification code.');
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2.5rem auto 4rem', padding: '0 1rem' }}>
      <div className="card" style={{ padding: 'clamp(1.25rem, 4vw, 2.25rem)' }}>
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'var(--primary-light)',
              color: 'var(--primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem'
            }}
          >
            <KeyRound size={26} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>
            {step === 3 ? 'Password Updated!' : 'Reset Your Password'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            {step === 1 && 'Enter your registered email address to receive a verification OTP.'}
            {step === 2 && `Enter the 6-digit OTP and choose a new secure password.`}
            {step === 3 && 'Your password has been changed. Sign in with your new credentials.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              padding: '0.85rem',
              borderRadius: 'var(--radius-sm)',
              color: '#991B1B',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Registered Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. admin@foodrescue.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <span className="form-hint">
                We'll generate a secure 6-digit one-time verification password.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              disabled={loading}
            >
              <span>{loading ? 'Sending Code...' : 'Send Verification OTP'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Step 2: OTP & New Password Form */}
        {step === 2 && (
          <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {simulatedOtp && (
              <div
                style={{
                  background: '#E8F8EE',
                  border: '1px solid #A7F3D0',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: '#065F46',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <ShieldCheck size={18} />
                <span>
                  <b>Simulated Verification OTP:</b> <span style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 800 }}>{simulatedOtp}</span>
                </span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">6-Digit Verification OTP</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 482910"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ fontFamily: 'monospace', letterSpacing: '4px', fontSize: '1.1rem', textAlign: 'center' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
              onClick={() => { setStep(1); setError(''); }}
            >
              ← Back to Change Email
            </button>
          </form>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
            <div style={{ color: 'var(--primary)', margin: '0 auto' }}>
              <CheckCircle2 size={54} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Password Changed Successfully</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                You can now log in using your updated password.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => navigate('/login')}
            >
              Proceed to Sign In
            </button>
          </div>
        )}

        {/* Back to Login Footer */}
        {step !== 3 && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem' }}>
            <Link to="/login" style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
