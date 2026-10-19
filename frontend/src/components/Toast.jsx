import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast, closeToast } = useApp();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />;
      case 'danger':
      case 'error':
        return <AlertCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />;
      default:
        return <Info size={20} style={{ color: 'var(--info)', flexShrink: 0 }} />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'var(--primary)';
      case 'danger':
      case 'error':
        return 'var(--danger)';
      default:
        return 'var(--info)';
    }
  };

  return (
    <div
      className="toast-banner"
      style={{
        borderLeftColor: getBorderColor()
      }}
      role="alert"
    >
      {getIcon()}
      <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
        {toast.message}
      </div>
      <button
        type="button"
        onClick={closeToast}
        style={{ color: 'var(--text-muted)', padding: '2px', cursor: 'pointer' }}
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}
