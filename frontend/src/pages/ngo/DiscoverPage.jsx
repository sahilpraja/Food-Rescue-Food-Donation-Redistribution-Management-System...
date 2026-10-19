import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ListingCard from '../../components/ListingCard';
import MapClusterView from '../../components/MapClusterView';
import {
  Compass,
  Map,
  List,
  SlidersHorizontal,
  Clock,
  ShieldAlert,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CATEGORIES, DIET_TYPES, calculateDistanceKm } from '../../lib/utils';

export default function DiscoverPage() {
  const { listings, currentUser } = useApp();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [radiusKm, setRadiusKm] = useState(15);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDiet, setSelectedDiet] = useState('ALL');
  const [sortBy, setSortBy] = useState('EXPIRY'); // 'EXPIRY', 'DISTANCE', 'NEWEST'
  const [searchQuery, setSearchQuery] = useState('');

  // NGO's coordinates
  const ngoCoords = currentUser?.coordinates || { lat: 28.6430, lng: 77.2140 };

  // Only ACTIVE listings appear in discovery (as per Brain.md Non-Negotiable #1)
  const activeListings = listings.filter((l) => l.status === 'ACTIVE');

  // Filter listings
  const filteredListings = activeListings
    .filter((item) => {
      // Distance filter
      const dist = calculateDistanceKm(
        ngoCoords.lat,
        ngoCoords.lng,
        item.coordinates?.lat,
        item.coordinates?.lng
      );
      if (dist > radiusKm) return false;

      // Category filter
      if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) {
        return false;
      }

      // Diet filter
      if (selectedDiet !== 'ALL' && item.dietType !== selectedDiet) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.donorName.toLowerCase().includes(q)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'EXPIRY') {
        return new Date(a.bestBefore).getTime() - new Date(b.bestBefore).getTime();
      }
      if (sortBy === 'DISTANCE') {
        const distA = calculateDistanceKm(ngoCoords.lat, ngoCoords.lng, a.coordinates?.lat, a.coordinates?.lng);
        const distB = calculateDistanceKm(ngoCoords.lat, ngoCoords.lng, b.coordinates?.lat, b.coordinates?.lng);
        return distA - distB;
      }
      // NEWEST
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      {/* Verification Notice Banner if NGO is unverified (BR-01) */}
      {!currentUser?.verified && (
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <ShieldAlert size={22} style={{ color: '#D97316', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#92400E', fontSize: '0.925rem' }}>
              NGO Verification In Progress (BR-01)
            </div>
            <div style={{ fontSize: '0.825rem', color: '#B45309' }}>
              Your shelter account is pending document review. You can explore available food in read-only mode, but the "Claim" button will be unlocked once approved by an administrator.
            </div>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              Surplus Food Discovery
            </span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#9CA3AF' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Center: {currentUser?.name || 'New Delhi'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
            Available Food Offers ({filteredListings.length})
          </h1>
        </div>

        {/* View Mode Toggle: List vs Map */}
        <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-sm)', minHeight: '34px', gap: '4px' }}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
            <span>List View</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-sm)', minHeight: '34px', gap: '4px' }}
            onClick={() => setViewMode('map')}
          >
            <Map size={16} />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {/* Search & Sort Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px' }}
              placeholder="Search by meal, restaurant, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Radius Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>Radius:</span>
              <input
                type="range"
                min="3"
                max="35"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                style={{ width: '100px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontWeight: 700, color: 'var(--primary-dark)', width: '42px' }}>{radiusKm} km</span>
            </div>

            {/* Sort selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>Sort:</span>
              <select className="form-select" style={{ width: 'auto', padding: '0.4rem 0.75rem' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="EXPIRY">⏰ Soonest Expiry</option>
                <option value="DISTANCE">📍 Nearest Distance</option>
                <option value="NEWEST">✨ Newly Listed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Chips: Category & Diet */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          {/* Categories */}
          <div className="chip-group">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', background: 'var(--border)' }} />

          {/* Diets */}
          <div className="chip-group">
            {DIET_TYPES.map((diet) => (
              <button
                type="button"
                key={diet.id}
                className={`chip ${selectedDiet === diet.id ? 'active' : ''}`}
                onClick={() => setSelectedDiet(diet.id)}
              >
                {diet.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content: Map or List */}
      {viewMode === 'map' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <MapClusterView
            listings={filteredListings}
            center={[ngoCoords.lat, ngoCoords.lng]}
            zoom={13}
            height="560px"
          />

          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            💡 Tip: Click on any food marker on the map to preview portions, urgency, and jump directly to claim.
          </div>
        </div>
      ) : (
        <div>
          {filteredListings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <Compass size={40} style={{ color: 'var(--text-light)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Available Food Listings Nearby</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0.5rem auto 1rem' }}>
                "No food nearby right now. We'll notify you the moment something is listed."
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setRadiusKm(30);
                  setSelectedCategory('All Categories');
                  setSelectedDiet('ALL');
                }}
              >
                Widen Search Radius (to 30 km)
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '1.5rem' }}>
              {filteredListings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  currentCoords={ngoCoords}
                  customLink={`/ngo/listings/${item.id}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
