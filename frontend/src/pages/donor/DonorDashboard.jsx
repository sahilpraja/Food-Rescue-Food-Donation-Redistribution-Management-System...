import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ListingCard from '../../components/ListingCard';
import StatusBadge from '../../components/StatusBadge';
import CountdownTag from '../../components/CountdownTag';
import {
  UtensilsCrossed,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  PackageOpen,
  UserCheck
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export default function DonorDashboard() {
  const { currentUser, listings, donorDecideClaim } = useApp();
  const navigate = useNavigate();

  // Filter listings by current donor
  const donorListings = listings.filter((l) => {
    if (!currentUser) return false;
    if (l.donorId === currentUser.id) return true;
    if (String(l.donorId) === String(currentUser.id)) return true;
    if (String(l.donorId) === `usr_donor_${currentUser.id}`) return true;
    if (`usr_donor_${l.donorId}` === String(currentUser.id)) return true;
    if (l.donorName && currentUser.name && l.donorName.toLowerCase() === currentUser.name.toLowerCase()) return true;
    return false;
  });
  const activeListings = donorListings.filter((l) => l.status === 'ACTIVE');
  const pendingClaims = donorListings.filter((l) => l.status === 'CLAIMED' && l.claim?.status === 'PENDING');
  const inProgress = donorListings.filter((l) => ['CLAIMED', 'PICKUP_ASSIGNED', 'IN_TRANSIT'].includes(l.status));
  const completed = donorListings.filter((l) => l.status === 'COMPLETED' || l.status === 'DELIVERED');

  // Total meals donated
  const totalMeals = completed.reduce((sum, l) => sum + (l.unit === 'portions' ? l.quantity : Math.round((l.weightKg * 1000) / 350)), 0);
  const totalKg = completed.reduce((sum, l) => sum + (l.weightKg || 10), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.25rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              Donor Portal
            </span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#9CA3AF' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentUser?.name}</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
            Kitchen Surplus Dashboard
          </h1>
        </div>

        <Link to="/donor/listings/new" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <PlusCircle size={18} />
          <span>New Surplus Donation</span>
        </Link>
      </div>

      {/* Action Banner: Pending Claims (FR-CLM-02) */}
      {pendingClaims.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #FEF3E8 0%, #FFF9E6 100%)',
            border: '2px solid #FCD3B0',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D97316', fontWeight: 700, marginBottom: '0.75rem' }}>
            <Clock size={18} />
            <span>Action Required: NGO Claim Received! (Please decide within 10 min)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pendingClaims.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  border: '1px solid #FED7AA'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-body)', marginTop: '2px' }}>
                    Claimant: <b>{item.claim?.ngoName}</b> • Mode: <b>{item.claim?.pickupMode === 'SELF' ? 'Self Collection' : 'Volunteer Courier'}</b>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#D97316', marginTop: '2px' }}>
                    ⏳ Claimed at {formatDateTime(item.claim?.createdAt)}. Auto-accepts if unaddressed to prevent food spoilage.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => donorDecideClaim(item.id, false, 'Capacity unavailable at kitchen')}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => donorDecideClaim(item.id, true)}
                  >
                    Accept Claim & Unlock Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F8EE', color: '#1F7A44' }}>
            🍲
          </div>
          <div>
            <div className="stat-val">{activeListings.length}</div>
            <div className="stat-label">Active Listed Surplus</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EBF3FD', color: '#1C65C9' }}>
            🚚
          </div>
          <div>
            <div className="stat-val">{inProgress.length}</div>
            <div className="stat-label">In Pickup / Transit</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3E8', color: '#D97316' }}>
            🥗
          </div>
          <div>
            <div className="stat-val">{totalMeals}</div>
            <div className="stat-label">Your Meals Redistributed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F3E8FF', color: '#7E22CE' }}>
            🌱
          </div>
          <div>
            <div className="stat-val">{Math.round(totalKg * 2.5)} kg</div>
            <div className="stat-label">Est. CO₂e Avoided</div>
          </div>
        </div>
      </div>

      {/* Active Listings Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Your Active Listings ({activeListings.length})</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Currently visible on discovery map to verified NGOs.
            </p>
          </div>
          <Link to="/donor/listings" className="btn btn-secondary btn-sm" style={{ gap: '4px' }}>
            <span>View All ({donorListings.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {activeListings.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
              <PackageOpen size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Active Listings Right Now</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '420px' }}>
              Have surplus food left over from today's service or event? Post it now to connect with hungry shelters nearby.
            </p>
            <Link to="/donor/listings/new" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
              Create a Quick Listing
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.25rem' }}>
            {activeListings.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                customLink={`/donor/listings/${item.id}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* In-Progress Donations with Handover OTPs */}
      {inProgress.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem' }}>
            Active Logistics & Handover Tasks ({inProgress.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {inProgress.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  borderLeft: '4px solid var(--info)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <StatusBadge status={item.status} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Claimed by {item.claim?.ngoName}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{item.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
                    Quantity: <b>{item.quantity} {item.unit}</b> • Mode: <b>{item.claim?.pickupMode}</b>
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {item.deliveryTask?.pickupOtp && item.status !== 'IN_TRANSIT' && (
                    <div
                      style={{
                        background: '#F0FDF4',
                        border: '1px solid #86EFAC',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 12px',
                        textAlign: 'center'
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                        Pickup OTP to Show Courier:
                      </span>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.15em', color: '#15803D' }}>
                        {item.deliveryTask.pickupOtp}
                      </div>
                    </div>
                  )}

                  <Link to={`/donor/listings/${item.id}`} className="btn btn-secondary btn-sm">
                    Manage & Track
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
