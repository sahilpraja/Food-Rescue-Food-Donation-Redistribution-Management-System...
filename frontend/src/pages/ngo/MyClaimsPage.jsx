import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';
import TrackingTimeline from '../../components/TrackingTimeline';
import {
  PackageOpen,
  KeyRound,
  Truck,
  Phone,
  Clock,
  CheckCircle2,
  Star,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export default function MyClaimsPage() {
  const { listings, currentUser, showToast, cancelClaim, updateClaim } = useApp();
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [cancelModalItem, setCancelModalItem] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // NGO's claimed listings
  const myClaims = listings.filter((l) => l.claim?.ngoId === currentUser?.id || l.claim?.ngoName === currentUser?.name);

  const handleRateSubmit = (e) => {
    e.preventDefault();
    showToast(`Thank you! Your ${ratingScore}-star rating has been recorded.`, 'success');
    setRatingModalOpen(false);
  };

  const handleCancelClaim = async (e) => {
    e.preventDefault();
    if (!cancelModalItem) return;
    try {
      await cancelClaim(cancelModalItem.id, cancelReason);
      setCancelModalItem(null);
      setCancelReason('');
    } catch (err) {
      // Error handled by toast
    }
  };

  const handleToggleMode = async (item) => {
    const currentMode = item.claim?.pickupMode || 'VOLUNTEER';
    const newMode = currentMode === 'VOLUNTEER' ? 'SELF' : 'VOLUNTEER';
    try {
      await updateClaim(item.id, { pickupMode: newMode });
    } catch (err) {
      // Error handled by toast
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
          Shelter Claims
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '2px' }}>
          My Claimed Donations ({myClaims.length})
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Track arrival of food to your shelter, manage delivery OTP handovers, and confirm receipts.
        </p>
      </div>

      {myClaims.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <PackageOpen size={40} style={{ color: 'var(--text-light)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Claims Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0.5rem auto 1.25rem' }}>
            Browse active food listings posted by restaurants, bakeries, and banquets nearby.
          </p>
          <Link to="/ngo/discover" className="btn btn-primary btn-sm">
            Discover Food Offers
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {myClaims.map((item) => {
            const hasDeliveryOtp = Boolean(item.deliveryTask?.deliveryOtp);
            const isCompleted = item.status === 'COMPLETED' || item.status === 'DELIVERED';

            return (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Header row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusBadge status={item.status} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Claimed on {formatDateTime(item.claim?.createdAt)}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                    Mode: {item.claim?.pickupMode === 'SELF' ? 'Self Collection' : 'Volunteer Courier'}
                  </span>
                </div>

                {/* Content grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '1.5rem' }}>
                  {/* Left: Food summary */}
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <img
                      src={item.photos?.[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'}
                      alt={item.title}
                      style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>
                        {item.title}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginTop: '4px' }}>
                        <b>{item.quantity} {item.unit}</b> (~{item.weightKg} kg)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Donor: <b>{item.donorName}</b>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Logistics & Contact */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                      Delivery Contact & Location:
                    </div>
                    <div>
                      📍 <b>Donor Address: </b>
                      <span>{item.claim?.status === 'ACCEPTED' ? `${item.address?.line1}, ${item.address?.city}` : item.approxLocation}</span>
                    </div>
                    {item.claim?.status === 'ACCEPTED' && item.donorPhone && (
                      <div>
                        📞 <b>Donor Phone: </b>
                        <a href={`tel:${item.donorPhone}`} style={{ color: 'var(--info-dark)' }}>{item.donorPhone}</a>
                      </div>
                    )}
                    {item.deliveryTask?.volunteerName && (
                      <div>
                        🚚 <b>Courier: </b>
                        <span>{item.deliveryTask.volunteerName} ({item.deliveryTask.volunteerPhone})</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Handover OTP to show courier or Rate button */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
                    {hasDeliveryOtp && !isCompleted ? (
                      <div
                        style={{
                          background: '#EFF6FF',
                          border: '2px solid #BFDBFE',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.75rem 1rem',
                          width: '100%'
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', color: '#1D4ED8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <KeyRound size={14} /> YOUR DELIVERY OTP
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '0.15em', color: '#1E40AF', fontFamily: 'monospace' }}>
                          {item.deliveryTask.deliveryOtp}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#3B82F6' }}>
                          Show this code to courier upon arrival at shelter to confirm delivery.
                        </div>
                      </div>
                    ) : isCompleted ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#166534', fontWeight: 700, fontSize: '0.85rem' }}>
                          <CheckCircle2 size={16} /> Delivered & Saved!
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ width: '100%', gap: '4px' }}
                          onClick={() => {
                            setSelectedListing(item);
                            setRatingModalOpen(true);
                          }}
                        >
                          <Star size={14} style={{ color: 'var(--accent)' }} />
                          <span>Rate Donor & Courier</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-dark)', fontWeight: 600 }}>
                          ⏳ Awaiting donor confirmation
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1, fontSize: '0.75rem', padding: '4px 6px' }}
                            onClick={() => handleToggleMode(item)}
                            title="Toggle between Volunteer Courier and Self-Pickup"
                          >
                            Switch Mode
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ flex: 1, fontSize: '0.75rem', padding: '4px 6px', color: 'var(--danger-dark)' }}
                            onClick={() => setCancelModalItem(item)}
                          >
                            Withdraw
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Collapsible/Expandable tracking lifecycle */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <TrackingTimeline listing={item} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Claim Modal */}
      {cancelModalItem && (
        <div className="modal-overlay" onClick={() => setCancelModalItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger-dark)', marginBottom: '0.5rem' }}>
              Withdraw Claim Request
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Are you sure you want to withdraw your claim for <b>"{cancelModalItem.title}"</b>? The listing will be returned to available status for other shelters.
            </p>
            <form onSubmit={handleCancelClaim}>
              <div className="form-group">
                <label className="form-label">Reason for Cancellation (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Schedule conflict / Shelter capacity reached"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCancelModalItem(null)}>
                  Keep Claim
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating & Feedback Modal (FR-RAT-01) */}
      {ratingModalOpen && (
        <div className="modal-overlay" onClick={() => setRatingModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Rate Food Donor & Courier (FR-RAT-01)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              For: {selectedListing?.title}
            </p>

            <form onSubmit={handleRateSubmit}>
              <div className="form-group">
                <label className="form-label">Rating Score (1 to 5 Stars)</label>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.75rem', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRatingScore(star)}
                      style={{ color: star <= ratingScore ? '#F5B301' : '#D1D5DB' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Feedback / Notes</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g. Excellent packaging, arrived hot and fresh, children loved the meal!"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRatingModalOpen(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
