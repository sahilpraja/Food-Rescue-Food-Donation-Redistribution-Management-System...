import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  Building,
  UserCheck
} from 'lucide-react';
import { storageService } from '../../lib/storageService';

export default function VerificationsQueuePage() {
  const { showToast, refreshState } = useApp();
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const users = storageService.getUsers();
  const pendingUsers = users.filter((u) => u.verificationStatus === 'PENDING' || (!u.verified && u.role === 'NGO'));
  const verifiedUsers = users.filter((u) => u.verified);

  const handleApprove = (user) => {
    storageService.updateUser(user.id, {
      verified: true,
      verificationStatus: 'APPROVED',
      verifiedAt: new Date().toISOString()
    });
    storageService.addNotification({
      userId: user.id,
      title: 'Verification Approved! 🎉',
      message: 'Your organization credentials have been verified by platform admins. You can now claim surplus food offers.',
      type: 'VERIFICATION_OUTCOME'
    });
    storageService.logAudit('Platform Administrator', 'APPROVED_VERIFICATION', `Approved ${user.name} (${user.role})`);
    showToast(`Approved verification for ${user.name}`, 'success');
  };

  const handleReject = (e) => {
    e.preventDefault();
    if (!rejectReason.trim() || !selectedUser) return;

    storageService.updateUser(selectedUser.id, {
      verified: false,
      verificationStatus: 'REJECTED',
      rejectReason: rejectReason.trim()
    });
    storageService.addNotification({
      userId: selectedUser.id,
      title: 'Verification Requires Action',
      message: `Your verification request was rejected: ${rejectReason}. Please upload correct documents.`,
      type: 'VERIFICATION_OUTCOME'
    });
    storageService.logAudit('Platform Administrator', 'REJECTED_VERIFICATION', `Rejected ${selectedUser.name}: ${rejectReason}`);
    showToast(`Rejected verification for ${selectedUser.name}`, 'info');
    setRejectModalOpen(false);
    setSelectedUser(null);
    setRejectReason('');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
          Compliance & Safety
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '2px' }}>
          Organization Verification Queue (FR-ADM-01)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Review official NGO registration certificates and commercial food donor licenses before unlocking claiming rights.
        </p>
      </div>

      {/* Pending Queue */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} style={{ color: '#D97316' }} />
          <span>Pending Document Verifications ({pendingUsers.length})</span>
        </h2>

        {pendingUsers.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <CheckCircle size={36} style={{ color: 'var(--primary)', margin: '0 auto 0.5rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>All Organizations Verified</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pending applications in the review queue.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="card"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1.25rem',
                  borderLeft: '4px solid #F5B301'
                }}
              >
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                      {user.role} AWAITING APPROVAL
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Submitted 2 hours ago
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginTop: '4px' }}>
                    Registration / Darpan ID: <b>{user.darpanRegNo || user.fssaiLicense || 'DL/2024/0987123'}</b>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Contact: {user.email} • {user.phone} • {user.address}
                  </div>

                  {/* Document preview pills */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', background: 'var(--bg-subtle)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <FileText size={13} />
                      <span>NGO_Registration_Cert.pdf (1.4 MB)</span>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', background: 'var(--bg-subtle)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <FileText size={13} />
                      <span>Director_Aadhaar_ID.pdf (820 KB)</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setRejectModalOpen(true);
                    }}
                    style={{ borderColor: 'var(--danger)', color: 'var(--danger-dark)' }}
                  >
                    Reject with Reason
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleApprove(user)}
                    style={{ gap: '4px' }}
                  >
                    <CheckCircle size={16} />
                    <span>Approve Verification</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Verified Organizations list */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
          <span>Active Verified Organizations ({verifiedUsers.length})</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1rem' }}>
          {verifiedUsers.map((u) => (
            <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#E8F8EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1F7A44', fontWeight: 700 }}>
                {u.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '0.95rem' }}>
                  <span>{u.name}</span>
                  <CheckCircle size={14} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {u.role} • {u.darpanRegNo || u.fssaiLicense || 'Verified ID'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mandatory Rejection Reason Modal (FR-VER-03) */}
      {rejectModalOpen && (
        <div className="modal-overlay" onClick={() => setRejectModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--danger-dark)' }}>
              Reject Verification Application (FR-VER-03)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Organization: <b>{selectedUser?.name}</b>. Rejection reason is mandatory and will be communicated to the applicant for corrective resubmission.
            </p>

            <form onSubmit={handleReject}>
              <div className="form-group">
                <label className="form-label">Mandatory Rejection Reason *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g. Document image is blurry / NGO Darpan registration number does not match submitted 12A certificate"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRejectModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
