import React from 'react';
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
  History
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export default function AdminOverviewPage() {
  const { impactMetrics, reports, auditLogs, users, listings, deleteListing, showToast } = useApp();

  const pendingVerifications = (users || []).filter((u) => u.verificationStatus === 'PENDING');
  const pendingReports = reports.filter((r) => r.status === 'PENDING');

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
    </div>
  );
}
