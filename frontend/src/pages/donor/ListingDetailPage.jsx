import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';
import CountdownTag from '../../components/CountdownTag';
import TrackingTimeline from '../../components/TrackingTimeline';
import {
  ArrowLeft,
  Clock,
  MapPin,
  UtensilsCrossed,
  ShieldCheck,
  Phone,
  User,
  AlertOctagon,
  KeyRound,
  CheckCircle,
  Truck,
  Edit3,
  Trash2
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings, currentUser, donorDecideClaim, cancelListing, deleteListing } = useApp();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const listing = listings.find((l) => String(l.id) === String(id));

  if (!listing) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <h2>Listing Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>The requested listing may have expired or been removed.</p>
        <Link to="/donor/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const isOwner = listing.donorId === currentUser?.id || currentUser?.role === 'ADMIN';
  const isPendingDecision = listing.status === 'CLAIMED' && listing.claim?.status === 'PENDING';

  const handleCancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    await cancelListing(listing.id, cancelReason);
    setCancelModalOpen(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete/cancel offer "${listing.title}"?`)) {
      await deleteListing(listing.id);
      navigate('/donor/listings');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(-1)}
          style={{ gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {isOwner && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {listing.status === 'ACTIVE' && (
              <Link to={`/donor/listings/edit/${listing.id}`} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
                <Edit3 size={15} />
                <span>Edit Listing</span>
              </Link>
            )}
            {listing.status !== 'DELIVERED' && listing.status !== 'COMPLETED' && listing.status !== 'CANCELLED' && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setCancelModalOpen(true)}
                style={{ gap: '6px', color: 'var(--danger-dark)' }}
              >
                <Trash2 size={15} />
                <span>Cancel Offer</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Food Details & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Photo Card */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ position: 'relative', width: '100%', height: '260px' }}>
              <img
                src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'}
                alt={listing.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                <StatusBadge status={listing.status} />
              </div>
              {listing.status === 'ACTIVE' && (
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <CountdownTag bestBefore={listing.bestBefore} />
                </div>
              )}
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                  {listing.category}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {listing.dietType === 'VEG' ? '🟢 Pure Veg' : listing.dietType === 'NON_VEG' ? '🔴 Non-Veg' : '🌱 Vegan'}
                </span>
              </div>

              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.25 }}>
                {listing.title}
              </h1>

              {/* Portion count banner */}
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-around',
                  textAlign: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {listing.quantity} {listing.unit}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Portion Count</div>
                </div>
                <div style={{ width: '1px', background: 'var(--border)' }} />
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ~{listing.weightKg || Math.round(listing.quantity * 0.35)} kg
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Weight</div>
                </div>
              </div>

              {/* Timings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Prepared Time:</span>
                  <span style={{ fontWeight: 600 }}>{formatDateTime(listing.preparedAt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Best-Before Deadline:</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger-dark)' }}>{formatDateTime(listing.bestBefore)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Packaging:</span>
                  <span style={{ fontWeight: 500 }}>{listing.packaging || 'Food grade boxes'}</span>
                </div>
              </div>

              {/* Allergens & Notes */}
              {listing.allergens?.length > 0 && (
                <div style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Allergens: </span>
                  <span>{listing.allergens.join(', ')}</span>
                </div>
              )}

              {listing.notes && (
                <div style={{ background: '#FFFBEB', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', color: '#92400E' }}>
                  <b>Donor Instructions:</b> {listing.notes}
                </div>
              )}
            </div>
          </div>

          {/* Cancel button if unclaimed / active */}
          {isOwner && ['ACTIVE', 'CLAIMED'].includes(listing.status) && (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ color: 'var(--danger)', alignSelf: 'flex-start', fontSize: '0.85rem' }}
              onClick={() => setCancelModalOpen(true)}
            >
              <AlertOctagon size={16} />
              <span>Cancel Listing</span>
            </button>
          )}
        </div>

        {/* Right Column: Claim Decisions, Handover Code, Logistics & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Claim Decision Panel (FR-CLM-02) */}
          {isPendingDecision && (
            <div
              className="card"
              style={{
                background: '#FEF3E8',
                border: '2px solid #FCD3B0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97316', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Clock size={20} />
                <span style={{ fontSize: '1.1rem' }}>Claim Decision Needed</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', marginBottom: '1rem' }}>
                <b>{listing.claim?.ngoName}</b> wants to claim this food via <b>{listing.claim?.pickupMode === 'SELF' ? 'Self Collection' : 'Volunteer Courier'}</b>.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  onClick={() => donorDecideClaim(listing.id, false, 'Surplus no longer available')}
                >
                  Decline
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  onClick={() => donorDecideClaim(listing.id, true)}
                >
                  Accept Claim
                </button>
              </div>
            </div>
          )}

          {/* Handover OTP Card for Pickup */}
          {listing.deliveryTask?.pickupOtp && listing.status !== 'DELIVERED' && listing.status !== 'COMPLETED' && (
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                border: '2px solid #86EFAC',
                textAlign: 'center',
                padding: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#166534', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <KeyRound size={18} />
                <span>PICKUP HANDOVER CODE</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#15803D', marginBottom: '0.75rem' }}>
                Show this 6-digit code to the courier / NGO representative when they arrive to collect food:
              </p>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  letterSpacing: '0.25em',
                  color: '#14532D',
                  fontFamily: 'monospace',
                  background: 'white',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 1rem',
                  display: 'inline-block',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {listing.deliveryTask.pickupOtp}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.5rem' }}>
                🔒 Verifies physical handover and transitions status to In-Transit.
              </div>
            </div>
          )}

          {/* Contact Details (Privacy protected until claim accepted - Brain.md Rule #2) */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              Counterparty & Location Info
            </h3>

            {listing.claim?.status === 'ACCEPTED' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} style={{ color: 'var(--primary)' }} />
                  <div>
                    <span style={{ fontWeight: 600 }}>Claimant NGO: </span>
                    <span>{listing.claim.ngoName}</span>
                  </div>
                </div>
                {listing.claim.ngoPhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} style={{ color: 'var(--primary)' }} />
                    <div>
                      <span style={{ fontWeight: 600 }}>Phone: </span>
                      <a href={`tel:${listing.claim.ngoPhone}`} style={{ color: 'var(--info-dark)', fontWeight: 600 }}>
                        {listing.claim.ngoPhone}
                      </a>
                    </div>
                  </div>
                )}
                {listing.deliveryTask?.volunteerName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={16} style={{ color: 'var(--accent)' }} />
                    <div>
                      <span style={{ fontWeight: 600 }}>Assigned Courier: </span>
                      <span>{listing.deliveryTask.volunteerName} ({listing.deliveryTask.volunteerPhone})</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                🔒 <b>Privacy Protected:</b> Direct phone numbers and exact addresses are disclosed only after a claim is confirmed.
              </div>
            )}
          </div>

          {/* Tracking Timeline */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
              Redistribution Lifecycle
            </h3>
            <TrackingTimeline listing={listing} />
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="modal-overlay" onClick={() => setCancelModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--danger-dark)' }}>
              Cancel Surplus Listing
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Please provide a reason for cancelling. If an NGO has already claimed this offer, they will be notified immediately.
            </p>
            <form onSubmit={handleCancel}>
              <div className="form-group">
                <label className="form-label">Cancellation Reason *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g. Food damaged during storage / Kitchen capacity issue"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCancelModalOpen(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
