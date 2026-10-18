import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserX,
  FileWarning
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export default function ReportsModerationPage() {
  const { reports, resolveReport } = useApp();
  const [activeTab, setActiveTab] = useState('PENDING');

  const pendingReports = reports.filter((r) => r.status === 'PENDING');
  const resolvedReports = reports.filter((r) => r.status === 'RESOLVED');

  const handleAction = (reportId, action) => {
    const note = prompt(`Enter resolution note for action: ${action}`) || 'Resolved by administrator';
    resolveReport(reportId, action, note);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase' }}>
          Trust & Safety
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '2px' }}>
          Moderation & Incident Reports (FR-RAT-02, FR-RAT-03)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Review reported listings, quality concerns, hygiene violations, and take disciplinary actions.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`chip ${activeTab === 'PENDING' ? 'active' : ''}`}
          onClick={() => setActiveTab('PENDING')}
        >
          Unresolved Reports ({pendingReports.length})
        </button>
        <button
          type="button"
          className={`chip ${activeTab === 'RESOLVED' ? 'active' : ''}`}
          onClick={() => setActiveTab('RESOLVED')}
        >
          Resolved Archive ({resolvedReports.length})
        </button>
      </div>

      {activeTab === 'PENDING' ? (
        pendingReports.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <CheckCircle size={36} style={{ color: 'var(--primary)', margin: '0 auto 0.5rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Zero Active Safety Reports</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>The community is operating smoothly and safely.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className="card"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1.25rem',
                  borderLeft: '4px solid var(--danger)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                      REPORTED {report.targetType}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Filed at {formatDateTime(report.createdAt)} by {report.reporterName}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {report.targetTitle || `Target ID: ${report.targetId}`}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: '#B91C1C', marginTop: '4px', background: '#FEF2F2', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                    <b>Report Reason: </b> {report.reason}
                  </div>
                </div>

                {/* Moderation Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleAction(report.id, 'DISMISSED')}
                  >
                    Dismiss Report
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ borderColor: 'var(--accent)', color: 'var(--accent-dark)' }}
                    onClick={() => handleAction(report.id, 'WARNED_USER')}
                  >
                    Issue Warning
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleAction(report.id, 'REMOVED_LISTING')}
                  >
                    Take Down Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {resolvedReports.map((report) => (
            <div key={report.id} className="card" style={{ opacity: 0.85 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  RESOLVED: {report.actionTaken}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatDateTime(report.resolvedAt)}
                </span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{report.targetTitle || report.targetId}</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-body)', marginTop: '2px' }}>
                <b>Note: </b> {report.adminNote || 'No extra note'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
