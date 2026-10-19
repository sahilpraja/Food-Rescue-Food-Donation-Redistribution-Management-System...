import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  FileSpreadsheet,
  Users,
  UtensilsCrossed,
  HeartHandshake,
  TrendingUp,
  ArrowRight,
  History,
  UserPlus,
  Copy,
  Check,
  Key,
  X
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export default function AdminOverviewPage() {
  const { impactMetrics, reports, auditLogs, users, listings, deleteListing, showToast, registerAdmin } = useApp();

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminCity, setAdminCity] = useState('New Delhi');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  const adminUsers = (users || []).filter((u) => u.role === 'ADMIN');

  const pendingVerifications = (users || []).filter((u) => u.verificationStatus === 'PENDING');
  const pendingReports = reports.filter((r) => r.status === 'PENDING');

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = 'Admin@';
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminPassword(pwd);
  };

  const openRegisterAdminModal = () => {
    setAdminName('');
    setAdminEmail('');
    setAdminPhone('');
    setAdminCity('New Delhi');
    generateRandomPassword();
    setCreatedCredentials(null);
    setAdminError('');
    setCopied(false);
    setShowAdminModal(true);
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    setAdminError('');

    if (!adminName.trim() || !adminEmail.trim() || !adminPhone.trim() || !adminPassword.trim()) {
      setAdminError('All fields marked with * are required.');
      return;
    }
    if (adminPassword.length < 6) {
      setAdminError('Password must be at least 6 characters.');
      return;
    }

    setAdminLoading(true);
    const res = await registerAdmin({
      name: adminName.trim(),
      email: adminEmail.trim(),
      phone: adminPhone.trim(),
      password: adminPassword,
      city: adminCity.trim() || 'New Delhi'
    });
    setAdminLoading(false);

    if (res.success) {
      setCreatedCredentials({
        name: adminName.trim(),
        email: adminEmail.trim(),
        phone: adminPhone.trim(),
        password: adminPassword,
        role: 'Platform Administrator'
      });
      showToast(`Admin account for ${adminName} registered successfully!`, 'success');
    } else {
      setAdminError(res.error || 'Failed to register admin.');
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Food Rescue Platform - Administrator Credentials:\n` +
      `Login URL: ${window.location.origin}/login\n` +
      `Admin ID (Email): ${createdCredentials.email}\n` +
      `Password: ${createdCredentials.password}\n` +
      `Role: Platform Administrator`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Admin credentials copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 3000);
  };

  const exportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Meals Served,${impactMetrics.totalMealsRedistributed}\n` +
      `Kg Saved,${impactMetrics.totalKgSaved}\n` +
      `CO2e Avoided (kg),${impactMetrics.co2eAvoidedKg}\n` +
      `Completion Rate,${impactMetrics.successRatePercent}%\n` +
      `Average Claim Time (min),${impactMetrics.averageClaimTimeMinutes}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `food_rescue_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Analytics summary exported as CSV file (FR-ADM-04)', 'success');
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7E22CE', textTransform: 'uppercase' }}>
            System Administration
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '2px' }}>
            Platform Operations & Moderation Console
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Monitor near real-time logistics, moderate organizations, and inspect audit logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={openRegisterAdminModal}
            style={{ gap: '6px', background: '#7E22CE', borderColor: '#7E22CE', color: '#fff' }}
          >
            <UserPlus size={16} />
            <span>+ Register Admin</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={exportCsv}
            style={{ gap: '6px' }}
          >
            <FileSpreadsheet size={16} />
            <span>Export CSV Report</span>
          </button>
          <Link to="/admin/verifications" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
            <ShieldCheck size={16} />
            <span>Verification Queue ({pendingVerifications.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F8EE', color: '#1F7A44' }}>
            🍲
          </div>
          <div>
            <div className="stat-val">{impactMetrics.totalMealsRedistributed.toLocaleString()}</div>
            <div className="stat-label">Meals Redistributed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3E8', color: '#D97316' }}>
            ⚖️
          </div>
          <div>
            <div className="stat-val">{impactMetrics.totalKgSaved.toLocaleString()} kg</div>
            <div className="stat-label">Food Saved from Waste</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EBF3FD', color: '#1C65C9' }}>
            ⏱️
          </div>
          <div>
            <div className="stat-val">{impactMetrics.averageClaimTimeMinutes} min</div>
            <div className="stat-label">Median Time-to-Claim</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F3E8FF', color: '#7E22CE' }}>
            🌱
          </div>
          <div>
            <div className="stat-val">{impactMetrics.co2eAvoidedKg.toLocaleString()} kg</div>
            <div className="stat-label">CO₂e Avoided (Estimate)</div>
          </div>
        </div>
      </div>

      {/* Admin Module Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '1.25rem' }}>
        {/* Verification Card */}
        <Link to="/admin/verifications" className="card card-hoverable" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E8F8EE', color: '#1F7A44', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            {pendingVerifications.length > 0 && (
              <span style={{ background: '#FEE2E2', color: '#991B1B', fontWeight: 800, fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                {pendingVerifications.length} Pending
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main)' }}>
            Organization Verifications
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Review NGO Darpan IDs, 80G registrations, and FSSAI business licenses.
          </p>
        </Link>

        {/* Reports & Safety Card */}
        <Link to="/admin/reports" className="card card-hoverable" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3E8', color: '#D97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} />
            </div>
            {pendingReports.length > 0 && (
              <span style={{ background: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                {pendingReports.length} Unresolved
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main)' }}>
            Trust & Safety Moderation
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Resolve food hygiene reports, quality issues, and user suspension requests.
          </p>
        </Link>

        {/* System Settings Card */}
        <Link to="/admin/settings" className="card card-hoverable" style={{ textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EBF3FD', color: '#1C65C9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Sliders size={20} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main)' }}>
            Platform Settings
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Configure default discovery radius, claim timeouts, meal weights & CO₂ factors.
          </p>
        </Link>

        {/* Audit Log Card */}
        <Link to="/admin/audit" className="card card-hoverable" style={{ textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <History size={20} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main)' }}>
            System Audit Log
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Search immutable logs of admin approvals, cancellations, and config updates.
          </p>
        </Link>
      </div>

      {/* Listings Moderation Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Donation Listings Moderation</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Review and moderate surplus listings across all donors.</p>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
            Total Offers: {listings.length}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.65rem 0.5rem' }}>ID</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Food Title</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Donor</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Qty</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.slice(0, 6).map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>#{item.id}</td>
                  <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>{item.title}</td>
                  <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)' }}>{item.donorName}</td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{item.quantity} {item.unit}</td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: item.status === 'ACTIVE' ? 'var(--primary-light)' : item.status === 'CANCELLED' ? '#FEE2E2' : 'var(--bg-subtle)',
                      color: item.status === 'ACTIVE' ? 'var(--primary-dark)' : item.status === 'CANCELLED' ? 'var(--danger-dark)' : 'var(--text-main)'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <Link to={`/donor/listings/${item.id}`} className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
                        View
                      </Link>
                      {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.75rem', color: 'var(--danger-dark)' }}
                          onClick={async () => {
                            if (window.confirm(`Moderate and cancel listing "${item.title}"?`)) {
                              await deleteListing(item.id);
                            }
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Administrators Management Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Platform Administrators ({adminUsers.length})</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Designated administrative accounts with system-wide moderation and management permissions.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={openRegisterAdminModal}
            style={{ gap: '6px', background: '#7E22CE', borderColor: '#7E22CE', color: '#fff' }}
          >
            <UserPlus size={16} />
            <span>+ Add New Admin</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.65rem 0.5rem' }}>Name</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Email / Login ID</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Phone</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Location</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Privilege</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                        {u.name?.charAt(0) || 'A'}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'monospace', color: 'var(--text-main)' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)' }}>
                    {u.phone || 'N/A'}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)' }}>
                    {u.city || 'HQ'}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <span style={{ background: '#F3E8FF', color: '#7E22CE', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.75rem' }}>
                      ADMIN
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <span style={{ background: '#E8F8EE', color: '#1F7A44', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.75rem' }}>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent System Activity Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Operational Audit Trail</h3>
          <Link to="/admin/audit" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
            View Full Log
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.65rem 0.5rem' }}>Timestamp</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Actor</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Action</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Target / Description</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)' }}>
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>
                    {log.actor}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <span style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.75rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-body)' }}>
                    {log.target}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register New Admin Modal */}
      {showAdminModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7E22CE', textTransform: 'uppercase' }}>
                  Admin Authorization
                </span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '2px' }}>
                  {createdCredentials ? 'Administrator Registered!' : 'Register New Administrator'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {createdCredentials
                    ? 'Copy and share these credentials with the designated administrator.'
                    : 'Create an administrator account with full platform management access.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Banner */}
            {adminError && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: '#991B1B', fontSize: '0.85rem', marginBottom: '1rem' }}>
                ⚠️ {adminError}
              </div>
            )}

            {!createdCredentials ? (
              <form onSubmit={handleRegisterAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Priya Sharma"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Administrator Email (Login ID) *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. priya.admin@foodrescue.org"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98765 43210"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Office / City Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. New Delhi"
                    value={adminCity}
                    onChange={(e) => setAdminCity(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Temporary Password *</label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      🎲 Generate Secure Password
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: '0.4rem', fontFamily: 'monospace', fontWeight: 700 }}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <span className="form-hint">
                    Min 6 characters. You can copy and share this password after registration.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, background: '#7E22CE', borderColor: '#7E22CE' }}
                    disabled={adminLoading}
                  >
                    {adminLoading ? 'Creating Administrator...' : 'Create Admin Account'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAdminModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1.5px dashed #CBD5E1',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1F7A44', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                    <Check size={18} />
                    <span>Administrator Credentials Ready</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                    <span style={{ fontWeight: 600 }}>{createdCredentials.name}</span>

                    <span style={{ color: 'var(--text-muted)' }}>Login ID / Email:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1E293B' }}>{createdCredentials.email}</span>

                    <span style={{ color: 'var(--text-muted)' }}>Password:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#7E22CE', background: '#F3E8FF', padding: '1px 6px', borderRadius: '4px', display: 'inline-block', width: 'fit-content' }}>
                      {createdCredentials.password}
                    </span>

                    <span style={{ color: 'var(--text-muted)' }}>Designated Role:</span>
                    <span style={{ fontWeight: 700, color: '#7E22CE' }}>{createdCredentials.role}</span>

                    <span style={{ color: 'var(--text-muted)' }}>Portal URL:</span>
                    <span style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>{window.location.origin}/login</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCopyCredentials}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAdminModal(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
