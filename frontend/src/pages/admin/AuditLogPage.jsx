import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Search, Filter } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export default function AuditLogPage() {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = auditLogs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.actor?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.target?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Compliance & Security
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '2px' }}>
            System Audit Log (FR-ADM-05)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Immutable chronological record of administrative actions, verifications, and system events.
          </p>
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '32px' }}
            placeholder="Search by actor, action or target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Timestamp</th>
                <th style={{ padding: '0.85rem 1rem' }}>Actor</th>
                <th style={{ padding: '0.85rem 1rem' }}>Action Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Details & Target</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {log.actor}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ background: '#E8F8EE', color: '#1F7A44', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.75rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-body)' }}>
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
