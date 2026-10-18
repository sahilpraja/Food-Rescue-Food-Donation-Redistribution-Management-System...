import React from 'react';
import { STATUS_MAP } from '../lib/utils';
import { CheckCircle2, Clock, Truck, PackageCheck, AlertTriangle, XCircle, UserCheck } from 'lucide-react';

export default function StatusBadge({ status }) {
  const meta = STATUS_MAP[status] || { label: status, color: '#6B7280', bgColor: '#F3F4F6' };

  const getIcon = () => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle2 size={13} />;
      case 'CLAIMED':
        return <Clock size={13} />;
      case 'PICKUP_ASSIGNED':
        return <UserCheck size={13} />;
      case 'IN_TRANSIT':
        return <Truck size={13} />;
      case 'DELIVERED':
      case 'COMPLETED':
        return <PackageCheck size={13} />;
      case 'EXPIRED':
        return <AlertTriangle size={13} />;
      case 'CANCELLED':
        return <XCircle size={13} />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`status-badge ${status}`}
      style={{
        backgroundColor: meta.bgColor,
        color: meta.color,
        border: `1px solid ${meta.color}33`
      }}
    >
      {getIcon()}
      {meta.label}
    </span>
  );
}
