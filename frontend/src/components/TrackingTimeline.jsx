import React from 'react';
import { formatDateTime } from '../lib/utils';
import { Check, Clock, User, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function TrackingTimeline({ listing }) {
  const steps = [
    {
      key: 'ACTIVE',
      title: 'Donation Listed',
      desc: `Published by ${listing.donorName}`,
      at: listing.createdAt,
      done: true
    },
    {
      key: 'CLAIMED',
      title: 'Claimed by NGO',
      desc: listing.claim?.ngoName
        ? `${listing.claim.ngoName} requested (${listing.claim.pickupMode === 'SELF' ? 'Self Collection' : 'Volunteer Courier'})`
        : 'Waiting for an NGO to claim',
      at: listing.claim?.createdAt,
      done: ['CLAIMED', 'PICKUP_ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(listing.status)
    },
    {
      key: 'PICKUP_ASSIGNED',
      title: 'Courier Assigned',
      desc: listing.deliveryTask?.volunteerName
        ? `${listing.deliveryTask.volunteerName} confirmed pickup task`
        : listing.claim?.pickupMode === 'SELF'
        ? 'NGO is self-collecting directly'
        : 'Waiting for volunteer to accept task',
      at: listing.deliveryTask?.assignedAt,
      done: ['PICKUP_ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(listing.status) || (listing.claim?.pickupMode === 'SELF' && ['DELIVERED', 'COMPLETED'].includes(listing.status))
    },
    {
      key: 'IN_TRANSIT',
      title: 'Food Picked Up (In Transit)',
      desc: listing.deliveryTask?.pickedAt
        ? `Handover verified with OTP at ${formatDateTime(listing.deliveryTask.pickedAt)}`
        : 'Awaiting donor handover OTP confirmation',
      at: listing.deliveryTask?.pickedAt,
      done: ['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(listing.status)
    },
    {
      key: 'DELIVERED',
      title: 'Delivered & Completed',
      desc: listing.status === 'COMPLETED' || listing.status === 'DELIVERED'
        ? 'Handover confirmed at NGO destination. Meals ready for distribution!'
        : 'Awaiting final delivery verification OTP',
      at: listing.completedAt,
      done: ['DELIVERED', 'COMPLETED'].includes(listing.status)
    }
  ];

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const isCurrent = step.done && (!steps[idx + 1] || !steps[idx + 1].done);

          return (
            <div key={step.key} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              {/* Vertical line indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: step.done ? 'var(--primary)' : '#E5E7EB',
                    color: step.done ? 'white' : '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    zIndex: 2,
                    boxShadow: isCurrent ? '0 0 0 4px var(--primary-light)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {step.done ? <Check size={16} /> : idx + 1}
                </div>
                {!isLast && (
                  <div
                    style={{
                      width: '2px',
                      flex: 1,
                      minHeight: '36px',
                      background: step.done && steps[idx + 1]?.done ? 'var(--primary)' : '#E5E7EB',
                      margin: '4px 0'
                    }}
                  />
                )}
              </div>

              {/* Step Content */}
              <div style={{ paddingBottom: isLast ? '0' : '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: step.done ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {step.title}
                  </h4>
                  {step.at && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDateTime(step.at)}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.825rem', color: step.done ? 'var(--text-body)' : 'var(--text-light)', marginTop: '2px' }}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
