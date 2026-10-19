import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ListingCard from '../../components/ListingCard';
import { PlusCircle, Search, Filter, PackageOpen } from 'lucide-react';

export default function MyListingsPage() {
  const { listings, currentUser } = useApp();
  const [filterTab, setFilterTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const myListings = listings.filter((l) => {
    if (!currentUser) return false;
    if (l.donorId === currentUser.id) return true;
    if (String(l.donorId) === String(currentUser.id)) return true;
    if (String(l.donorId) === `usr_donor_${currentUser.id}`) return true;
    if (`usr_donor_${l.donorId}` === String(currentUser.id)) return true;
    if (l.donorName && currentUser.name && l.donorName.toLowerCase() === currentUser.name.toLowerCase()) return true;
    return false;
  });

  const filtered = myListings.filter((item) => {
    if (filterTab === 'ACTIVE' && item.status !== 'ACTIVE') return false;
    if (filterTab === 'CLAIMED' && !['CLAIMED', 'PICKUP_ASSIGNED', 'IN_TRANSIT'].includes(item.status)) return false;
    if (filterTab === 'COMPLETED' && !['COMPLETED', 'DELIVERED'].includes(item.status)) return false;
    if (filterTab === 'EXPIRED' && !['EXPIRED', 'CANCELLED'].includes(item.status)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Offer History
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '2px' }}>My Surplus Listings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track your posted food donations, active pickups, and historical impact.
          </p>
        </div>

        <Link to="/donor/listings/new" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <PlusCircle size={18} />
          <span>Post New Donation</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="chip-group">
          <button
            type="button"
            className={`chip ${filterTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterTab('ALL')}
          >
            All Offers ({myListings.length})
          </button>
          <button
            type="button"
            className={`chip ${filterTab === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setFilterTab('ACTIVE')}
          >
            Available ({myListings.filter((l) => l.status === 'ACTIVE').length})
          </button>
          <button
            type="button"
            className={`chip ${filterTab === 'CLAIMED' ? 'active' : ''}`}
            onClick={() => setFilterTab('CLAIMED')}
          >
            In Progress ({myListings.filter((l) => ['CLAIMED', 'PICKUP_ASSIGNED', 'IN_TRANSIT'].includes(l.status)).length})
          </button>
          <button
            type="button"
            className={`chip ${filterTab === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setFilterTab('COMPLETED')}
          >
            Completed ({myListings.filter((l) => ['COMPLETED', 'DELIVERED'].includes(l.status)).length})
          </button>
          <button
            type="button"
            className={`chip ${filterTab === 'EXPIRED' ? 'active' : ''}`}
            onClick={() => setFilterTab('EXPIRED')}
          >
            Expired / Closed ({myListings.filter((l) => ['EXPIRED', 'CANCELLED'].includes(l.status)).length})
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '32px' }}
            placeholder="Search by food name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid or Empty */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <PackageOpen size={36} style={{ color: 'var(--text-light)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>No Listings Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Try selecting a different tab or posting a new surplus food donation.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.5rem' }}>
          {filtered.map((item) => (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <ListingCard
                listing={item}
                customLink={`/donor/listings/${item.id}`}
                showClaimBtn={item.status !== 'ACTIVE'}
              />
              {item.status === 'ACTIVE' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <Link
                    to={`/donor/listings/edit/${item.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, gap: '4px', fontSize: '0.8rem' }}
                  >
                    ✏️ Edit
                  </Link>
                  <Link
                    to={`/donor/listings/${item.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, fontSize: '0.8rem' }}
                  >
                    Manage
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
