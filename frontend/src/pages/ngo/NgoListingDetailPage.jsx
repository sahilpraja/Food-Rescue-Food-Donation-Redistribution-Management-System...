import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';
import CountdownTag from '../../components/CountdownTag';
import {
  ArrowLeft,
  MapPin,
  UtensilsCrossed,
  ShieldCheck,
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  Lock,
  HeartHandshake
} from 'lucide-react';
import { formatDateTime, calculateDistanceKm } from '../../lib/utils';

export default function NgoListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings, currentUser, claimListing } = useApp();

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [pickupMode, setPickupMode] = useState('VOLUNTEER'); // 'SELF' or 'VOLUNTEER'
  const [submitting, setSubmitting] = useState(false);

  const listing = listings.find((l) => l.id === id);

  if (!listing) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <h2>Food Offer Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>This listing may have expired or been fulfilled.</p>
        <Link to="/ngo/discover" className="btn btn-primary">Back to Discovery</Link>
      </div>
    );
  }

  const distance = calculateDistanceKm(
    currentUser?.coordinates?.lat || 28.6430,
    currentUser?.coordinates?.lng || 77.2140,
    listing.coordinates?.lat,
    listing.coordinates?.lng
  );

  const isVerified = currentUser?.verified;
  const isAvailable = listing.status === 'ACTIVE';

  const handleClaim = () => {
    setSubmitting(true);
    try {
      claimListing(listing.id, pickupMode);
      setClaimModalOpen(false);
      navigate('/ngo/claims');
    } catch (err) {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(-1)}
          style={{ gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Food photos and specifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', width: '100%', height: '280px' }}>
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

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                    {listing.category}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {listing.dietType === 'VEG' ? '🟢 Pure Veg' : listing.dietType === 'NON_VEG' ? '🔴 Non-Veg' : '🌱 Vegan'}
                  </span>
                </div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.25 }}>
                  {listing.title}
                </h1>
              </div>

              {/* Portion Metrics */}
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
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {listing.quantity} {listing.unit}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quantity Available</div>
                </div>
                <div style={{ width: '1px', background: 'var(--border)' }} />
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ~{listing.weightKg || Math.round(listing.quantity * 0.35)} kg
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Weight</div>
                </div>
                <div style={{ width: '1px', background: 'var(--border)' }} />
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                    {distance} km
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From Your Shelter</div>
                </div>
              </div>

              {/* Prepared & Best-Before Timings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Prepared Time:</span>
                  <span style={{ fontWeight: 600 }}>{formatDateTime(listing.preparedAt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Must Consume Before (Hard Expiry):</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger-dark)' }}>{formatDateTime(listing.bestBefore)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Pickup Window:</span>
                  <span style={{ fontWeight: 500 }}>
                    {formatDateTime(listing.pickupFrom)} to {formatDateTime(listing.pickupTo)}
                  </span>
                </div>
              </div>

              {/* Allergens & Packaging */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                <div>
                  <b>Packaging: </b>
                  <span>{listing.packaging || 'Food grade containers'}</span>
                </div>
                {listing.allergens?.length > 0 && (
                  <div>
                    <b>Allergens: </b>
                    <span style={{ color: '#92400E' }}>{listing.allergens.join(', ')}</span>
                  </div>
                )}
                {listing.notes && (
                  <div style={{ background: '#FFFBEB', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.25rem' }}>
                    <b>Donor Notes: </b>
                    <span>{listing.notes}</span>
                  </div>
                )}
              </div>

              {/* Verified food safety pledge indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem', background: '#F0FDF4', borderRadius: 'var(--radius-sm)', color: '#166534', fontSize: '0.825rem' }}>
                <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                <span>Donor confirmed FSSAI-compliant hygienic preparation & safe storage pledge.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Donor Info, Approximate Map, and Claim CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Donor Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Donor Organization
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E8F8EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1F7A44', fontWeight: 800, fontSize: '1.1rem' }}>
                {listing.donorName?.[0] || 'D'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '1rem' }}>
                  <span>{listing.donorName}</span>
                  {listing.donorVerified && (
                    <CheckCircle size={15} style={{ color: 'var(--primary)' }} title="Verified Donor" />
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ★ {listing.donorRating || '4.8'} Donor Rating
                </div>
              </div>
            </div>

            {/* Approximate Area Info (Brain.md Non-negotiable #2) */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: '0.5rem' }}>
                <MapPin size={16} style={{ color: 'var(--primary)' }} />
                <span>Approximate Area: <b>{listing.approxLocation}</b></span>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                🔒 <b>Privacy Notice:</b> Exact building address, contact phone, and kitchen entry instructions will be revealed immediately after claim acceptance.
              </div>
            </div>
          </div>

          {/* Claim Action Box */}
          <div className="card" style={{ borderTop: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Claim Food for Your Shelter
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Atomic 1-claim lock prevents double claims. Free of charge.
              </p>
            </div>

            {!isVerified ? (
              <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400E', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Lock size={16} />
                  <span>Claiming Locked: NGO Verification Pending</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#B45309', marginTop: '4px' }}>
                  As per safety guidelines (BR-01), only verified NGOs can claim surplus food donations. Your registration is currently awaiting administrative verification.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem', opacity: 0.6 }}
                  disabled
                >
                  Claim Disabled (Unverified)
                </button>
              </div>
            ) : !isAvailable ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                <p style={{ fontWeight: 600 }}>This offer is currently {listing.status}.</p>
                <Link to="/ngo/discover" className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
                  Browse Other Offers
                </Link>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', fontSize: '1.05rem', gap: '0.5rem' }}
                onClick={() => setClaimModalOpen(true)}
              >
                <HeartHandshake size={20} />
                <span>Claim This Food Now</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Claim Confirmation Modal (FR-CLM-01 & FR-CLM-03) */}
      {claimModalOpen && (
        <div className="modal-overlay" onClick={() => setClaimModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Confirm Food Claim
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              You are claiming: <b>{listing.title}</b> ({listing.quantity} {listing.unit})
            </p>

            {/* Pickup Mode Selection */}
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                How Will You Collect This Food? (FR-CLM-03) *
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${pickupMode === 'VOLUNTEER' ? 'var(--primary)' : 'var(--border)'}`,
                    background: pickupMode === 'VOLUNTEER' ? 'var(--primary-light)' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="pickupMode"
                    value="VOLUNTEER"
                    checked={pickupMode === 'VOLUNTEER'}
                    onChange={() => setPickupMode('VOLUNTEER')}
                    style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck size={16} /> Request Volunteer Courier (Recommended)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Our community volunteers will be notified to pick up and deliver directly to your shelter.
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${pickupMode === 'SELF' ? 'var(--primary)' : 'var(--border)'}`,
                    background: pickupMode === 'SELF' ? 'var(--primary-light)' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="pickupMode"
                    value="SELF"
                    checked={pickupMode === 'SELF'}
                    onChange={() => setPickupMode('SELF')}
                    style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>
                      Self-Collection (We will pick it up)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Your staff/volunteers will collect directly from the donor kitchen.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Acknowledgment disclaimer */}
            <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)', margin: '1rem 0' }}>
              ✓ By confirming, this listing will be locked exclusively to your organization. The donor has up to 10 minutes to review.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setClaimModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClaim}
                disabled={submitting}
              >
                {submitting ? 'Claiming...' : 'Confirm & Submit Claim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
