import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  User,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  Star,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, logout, showToast, setCurrentUser, updateProfile, changePassword } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (updateProfile) {
        await updateProfile({
          name,
          phone,
          addressLine: address,
          city: currentUser?.city || 'Delhi NCR'
        });
      } else {
        setCurrentUser({
          ...currentUser,
          name,
          phone,
          address
        });
      }
      showToast('Profile information updated successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New password and confirm password do not match.');
      return;
    }

    setIsChangingPw(true);
    try {
      if (changePassword) {
        const res = await changePassword(currentPassword, newPassword);
        if (res && res.success === false) {
          setPwError(res.error || 'Failed to update password.');
          return;
        }
      }
      setPwSuccess('Password has been successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPw(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
          Account Management
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '2px' }}>
          Partner Profile & Settings (FR-AUTH-06)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your organization details, verification credentials, and contact information.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800 }}>
            {currentUser?.name?.[0] || 'U'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                {currentUser?.name}
              </h2>
              {currentUser?.verified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#E8F8EE', color: '#1F7A44', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                  <CheckCircle2 size={13} /> Verified
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Role: <b>{currentUser?.role}</b> • {currentUser?.type}
            </div>
            {currentUser?.rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#B45309', marginTop: '4px' }}>
                <Star size={14} fill="#F5B301" color="#F5B301" />
                <span><b>{currentUser.rating}</b> ({currentUser.ratingCount || 12} completed ratings)</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Credentials */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
            <span>Organization Verification Records:</span>
          </div>
          <div>
            <b>Credential / Reg No: </b> {currentUser?.darpanRegNo || currentUser?.fssaiLicense || 'DL/2021/0291884'}
          </div>
          <div>
            <b>Verification Status: </b>{' '}
            <span style={{ color: currentUser?.verified ? '#166534' : '#D97316', fontWeight: 700 }}>
              {currentUser?.verified ? 'Verified & Authorized to Operate' : 'Pending Verification'}
            </span>
          </div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Display Name / Organization Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid-responsive-2col">
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email (Read Only)</label>
              <input
                type="email"
                className="form-input"
                value={currentUser?.email || ''}
                disabled
                style={{ background: '#F3F4F6' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Address / Kitchen Location</label>
            <input
              type="text"
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary btn-sm" style={{ gap: '6px' }} disabled={isSubmitting}>
              <Save size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Reset Section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(22, 163, 74, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <KeyRound size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Security & Password Reset
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '2px 0 0' }}>
              Update your account password or set a new security credential.
            </p>
          </div>
        </div>

        {pwSuccess && (
          <div style={{
            padding: '0.875rem 1rem',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: 'var(--radius-md, 8px)',
            color: '#065F46',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem'
          }}>
            <CheckCircle2 size={18} />
            <span>{pwSuccess}</span>
          </div>
        )}

        {pwError && (
          <div style={{
            padding: '0.875rem 1rem',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md, 8px)',
            color: '#991B1B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={18} />
            <span>{pwError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showCurrentPw ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter current password (if set)"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                tabIndex={-1}
              >
                {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid-responsive-2col">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  tabIndex={-1}
                >
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  tabIndex={-1}
                >
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
              disabled={isChangingPw}
            >
              <Lock size={16} />
              <span>{isChangingPw ? 'Updating Password...' : 'Reset / Change Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Session Actions */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Account Session</h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Logged in as {currentUser?.email || 'Active User'} ({currentUser?.role})
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ color: 'var(--danger-dark)', borderColor: 'var(--border)', gap: '6px' }}
          onClick={() => {
            if (logout) logout();
            navigate('/');
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
