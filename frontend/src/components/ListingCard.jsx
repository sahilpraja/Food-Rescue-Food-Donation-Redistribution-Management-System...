import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import CountdownTag from './CountdownTag';
import { MapPin, CheckCircle, Package, Utensils, ArrowRight } from 'lucide-react';
import { calculateDistanceKm } from '../lib/utils';
import { useApp } from '../context/AppContext';

export default function ListingCard({ listing, currentCoords, showClaimBtn = true, customLink }) {
  const { currentUser } = useApp();

  const userLat = currentCoords?.lat || currentUser?.coordinates?.lat || 28.6430;
  const userLng = currentCoords?.lng || currentUser?.coordinates?.lng || 77.2140;

  const distance = calculateDistanceKm(
    userLat,
    userLng,
    listing.coordinates?.lat,
    listing.coordinates?.lng
  );

  const getDietBadge = () => {
    switch (listing.dietType) {
      case 'VEG':
        return <span style={{ color: '#2E9E5B', fontSize: '0.8rem', fontWeight: 600 }}>🟢 Pure Veg</span>;
      case 'NON_VEG':
        return <span style={{ color: '#D64545', fontSize: '0.8rem', fontWeight: 600 }}>🔴 Non-Veg</span>;
      case 'VEGAN':
        return <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 600 }}>🌱 Vegan</span>;
      default:
        return null;
    }
  };

  const linkTarget = customLink || (
    currentUser?.role === 'DONOR' && listing.donorId === currentUser?.id
      ? `/donor/listings/${listing.id}`
      : `/ngo/listings/${listing.id}`
  );

  return (
    <div className="card card-hoverable" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden' }}>
      {/* Top Media */}
      <div style={{ position: 'relative', width: '100%', height: '180px', background: '#F3F4F6' }}>
        <img
          src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'}
          alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', zIndex: 2 }}>
          <StatusBadge status={listing.status} />
        </div>

        {/* Countdown Badge Overlay (top right) */}
        {listing.status === 'ACTIVE' && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2 }}>
            <CountdownTag bestBefore={listing.bestBefore} />
          </div>
        )}

        {/* Category Pill (bottom left) */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(17, 24, 39, 0.75)',
            backdropFilter: 'blur(4px)',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          {listing.category}
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.65rem' }}>
        {/* Donor info & distance */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
            <span>{listing.donorName}</span>
            {listing.donorVerified && (
              <CheckCircle size={13} style={{ color: 'var(--primary)' }} title="Verified Donor" />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <MapPin size={13} />
            <span>~{distance} km</span>
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0', lineHeight: 1.3 }}>
          <Link to={linkTarget} style={{ color: 'inherit' }}>
            {listing.title}
          </Link>
        </h3>

        {/* Quantity & Diet */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Utensils size={15} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              {listing.quantity} {listing.unit}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ({listing.weightKg ? `~${listing.weightKg} kg` : ''})
            </span>
          </div>
          <div>{getDietBadge()}</div>
        </div>

        {/* CTA Button */}
        {showClaimBtn && (
          <Link
            to={linkTarget}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '0.4rem', width: '100%', justifyContent: 'space-between' }}
          >
            <span>{listing.status === 'ACTIVE' ? 'Review & Claim' : 'View Tracking'}</span>
            <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </div>
  );
}
