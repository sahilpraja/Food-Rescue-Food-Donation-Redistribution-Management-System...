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
  Save
} from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, logout, showToast, setCurrentUser, updateProfile } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
