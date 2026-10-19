import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  UtensilsCrossed,
  Camera,
  Clock,
  MapPin,
  ShieldAlert,
  Sparkles,
  Check,
  AlertCircle,
  Copy
} from 'lucide-react';
import { CATEGORIES, DIET_TYPES, formatForDateTimeInput } from '../../lib/utils';

export default function CreateListingPage() {
  const { currentUser, createListing, listings } = useApp();
  const navigate = useNavigate();

  // Quick Preset options
  const PRESET_HOURS = [2, 4, 6, 8];
  const ALLERGEN_OPTIONS = ['Dairy', 'Gluten', 'Nuts / Peanuts', 'Soy', 'Eggs', 'Mustard'];

  const defaultPreparedAt = formatForDateTimeInput(new Date());
  const defaultBestBefore = formatForDateTimeInput(new Date(Date.now() + 4 * 60 * 60 * 1000));
  const defaultPickupFrom = formatForDateTimeInput(new Date());
  const defaultPickupTo = formatForDateTimeInput(new Date(Date.now() + 2 * 60 * 60 * 1000));

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [dietType, setDietType] = useState('VEG');
  const [quantity, setQuantity] = useState(40);
  const [unit, setUnit] = useState('portions');
  const [packaging, setPackaging] = useState('Disposable food boxes');
  const [preparedAt, setPreparedAt] = useState(defaultPreparedAt);
  const [bestBefore, setBestBefore] = useState(defaultBestBefore);
  const [pickupFrom, setPickupFrom] = useState(defaultPickupFrom);
  const [pickupTo, setPickupTo] = useState(defaultPickupTo);
  const [allergens, setAllergens] = useState(['Dairy']);
  const [notes, setNotes] = useState('');
  const [safetyDeclaration, setSafetyDeclaration] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80');
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [errors, setErrors] = useState({});

  // Preset quick button for best before
  const handleQuickPreset = (hours) => {
    const target = formatForDateTimeInput(new Date(Date.now() + hours * 60 * 60 * 1000));
    setBestBefore(target);
    // Adjust pickupTo to be slightly before bestBefore
    const pickupTarget = formatForDateTimeInput(new Date(Date.now() + (hours - 0.5) * 60 * 60 * 1000));
    setPickupTo(pickupTarget);
  };

  // Toggle allergen
  const toggleAllergen = (item) => {
    if (allergens.includes(item)) {
      setAllergens(allergens.filter((a) => a !== item));
    } else {
      setAllergens([...allergens, item]);
    }
  };

  // Duplicate from previous listing template (FR-LST-07)
  const applyTemplate = (prev) => {
    setTitle(prev.title);
    setCategory(prev.category);
    setDietType(prev.dietType);
    setQuantity(prev.quantity);
    setUnit(prev.unit);
    setPackaging(prev.packaging);
    setAllergens(prev.allergens || []);
    setNotes(prev.notes || '');
    if (prev.photos?.[0]) setPhotoUrl(prev.photos[0]);
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required (e.g. 50 Dal Makhani & Roti Meals)';
    if (!quantity || Number(quantity) <= 0) errs.quantity = 'Quantity must be greater than 0';

    const prepTime = new Date(preparedAt).getTime();
    const expiryTime = new Date(bestBefore).getTime();
    const pickupEndTime = new Date(pickupTo).getTime();

    if (expiryTime <= prepTime) {
      errs.bestBefore = 'Best-before time must be later than prepared-at time.';
    }
    if (expiryTime <= Date.now()) {
      errs.bestBefore = 'Best-before time cannot be in the past.';
    }
    if (pickupEndTime > expiryTime) {
      errs.pickupTo = 'Pickup window must end before best-before expiry time.';
    }
    if (!safetyDeclaration) {
      errs.safetyDeclaration = 'You must confirm the food safety declaration to publish.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const newListing = createListing({
      title,
      category,
      dietType,
      quantity: Number(quantity),
      unit,
      packaging,
      preparedAt: new Date(preparedAt).toISOString(),
      bestBefore: new Date(bestBefore).toISOString(),
      pickupFrom: new Date(pickupFrom).toISOString(),
      pickupTo: new Date(pickupTo).toISOString(),
      address: {
        line1: currentUser.address || 'Block B, Connaught Place',
        city: currentUser.city || 'New Delhi',
        pincode: '110001'
      },
      coordinates: currentUser.coordinates || { lat: 28.6315, lng: 77.2167 },
      allergens,
      notes,
      safetyDeclaration,
      photos: [photoUrl]
    });

    navigate(`/donor/listings/${newListing.id}`);
  };

  // Find previous listings by this donor to use as template
  const donorPastListings = listings.filter((l) => l.donorId === currentUser?.id);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            New Donation Offer
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '2px' }}>Donate Surplus Food</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Designed for quick completion (&lt; 2 mins). Protect food quality and connect with nearby shelters.
          </p>
        </div>

        {/* Template shortcut */}
        {donorPastListings.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => applyTemplate(donorPastListings[0])}
            title="Pre-fill details from your last listing"
            style={{ gap: '0.4rem', borderStyle: 'dashed' }}
          >
            <Copy size={15} />
            <span>Use Last Listing Template</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Food Details */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UtensilsCrossed size={18} style={{ color: 'var(--primary)' }} />
            1. What Food Are You Donating?
          </h3>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              Food Title / Description *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 50 Fresh Paneer Butter Masala & Pulao Boxes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Category Chips */}
          <div className="form-group">
            <label className="form-label">Food Category *</label>
            <div className="chip-group">
              {CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`chip ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Diet Type Chips */}
          <div className="form-group">
            <label className="form-label">Dietary Classification *</label>
            <div className="chip-group">
              <button
                type="button"
                className={`chip ${dietType === 'VEG' ? 'active' : ''}`}
                onClick={() => setDietType('VEG')}
                style={{ borderColor: dietType === 'VEG' ? '#2E9E5B' : undefined }}
              >
                🟢 Pure Vegetarian
              </button>
              <button
                type="button"
                className={`chip ${dietType === 'NON_VEG' ? 'active' : ''}`}
                onClick={() => setDietType('NON_VEG')}
                style={{ borderColor: dietType === 'NON_VEG' ? '#D64545' : undefined }}
              >
                🔴 Non-Vegetarian
              </button>
              <button
                type="button"
                className={`chip ${dietType === 'VEGAN' ? 'active' : ''}`}
                onClick={() => setDietType('VEGAN')}
                style={{ borderColor: dietType === 'VEGAN' ? '#059669' : undefined }}
              >
                🌱 Vegan
              </button>
            </div>
          </div>

          {/* Quantity & Unit Stepper */}
          <div className="grid-responsive-2col">
            <div className="form-group">
              <label className="form-label">Quantity Count *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setQuantity(Math.max(1, Number(quantity) - 10))}
                  style={{ width: '40px', fontWeight: 800 }}
                >
                  -
                </button>
                <input
                  type="number"
                  className="form-input"
                  style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' }}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  required
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setQuantity(Number(quantity) + 10)}
                  style={{ width: '40px', fontWeight: 800 }}
                >
                  +
                </button>
              </div>
              {errors.quantity && <span className="form-error">{errors.quantity}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Unit of Measure *</label>
              <select className="form-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="portions">Portions / Meal Boxes</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="boxes">Boxes / Crates</option>
                <option value="litres">Litres</option>
              </select>
              <span className="form-hint">
                Approx impact: ~{unit === 'portions' ? quantity : Math.round(Number(quantity) / 0.35)} meals saved
              </span>
            </div>
          </div>

          {/* Packaging */}
          <div className="form-group">
            <label className="form-label">Packaging Type</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Disposable eco trays, Bulk thermos, Sealed containers"
              value={packaging}
              onChange={(e) => setPackaging(e.target.value)}
            />
          </div>

          {/* Allergens */}
          <div className="form-group">
            <label className="form-label">Allergens Present</label>
            <div className="chip-group">
              {ALLERGEN_OPTIONS.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`chip ${allergens.includes(item) ? 'active' : ''}`}
                  onClick={() => toggleAllergen(item)}
                >
                  {allergens.includes(item) ? '✓ ' : '+ '}
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Safety & Timings */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: 'var(--primary)' }} />
            2. Safety Timings & Pickup Window
          </h3>

          {/* Quick presets for Best Before */}
          <div style={{ marginBottom: '1.25rem', background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
              Quick Best-Before Presets from Now:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PRESET_HOURS.map((h) => (
                <button
                  type="button"
                  key={h}
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleQuickPreset(h)}
                  style={{ background: 'white' }}
                >
                  +{h} Hours
                </button>
              ))}
            </div>
          </div>

          <div className="grid-responsive-2col">
            <div className="form-group">
              <label className="form-label">Prepared At *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={preparedAt}
                onChange={(e) => setPreparedAt(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--danger-dark)' }}>
                Best Before (Expiry) *
              </label>
              <input
                type="datetime-local"
                className="form-input"
                style={{ borderColor: 'var(--accent)' }}
                value={bestBefore}
                onChange={(e) => setBestBefore(e.target.value)}
                required
              />
              {errors.bestBefore && <span className="form-error">{errors.bestBefore}</span>}
            </div>
          </div>

          <div className="grid-responsive-2col">
            <div className="form-group">
              <label className="form-label">Pickup Available From</label>
              <input
                type="datetime-local"
                className="form-input"
                value={pickupFrom}
                onChange={(e) => setPickupFrom(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pickup Must End By</label>
              <input
                type="datetime-local"
                className="form-input"
                value={pickupTo}
                onChange={(e) => setPickupTo(e.target.value)}
              />
              {errors.pickupTo && <span className="form-error">{errors.pickupTo}</span>}
            </div>
          </div>
        </div>

        {/* Section 3: Photo & Notes */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={18} style={{ color: 'var(--primary)' }} />
            3. Photo & Handling Notes
          </h3>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <img
              src={photoUrl}
              alt="Preview"
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Listing Photo Preview
              </span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Good food photos help NGOs and shelters assess portions and transport requirements.
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80')}
                >
                  Biryani / Rice
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80')}
                >
                  Bakery Loaves
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80')}
                >
                  Curry & Roti
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Special Notes for Courier / Shelter</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="e.g. Please bring insulated bag. Hot soup kept in stainless bucket. Call kitchen on arrival."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Mandatory Food Safety Declaration (BR-04) */}
        <div
          className="card"
          style={{
            background: safetyDeclaration ? '#F0FDF4' : '#FFFBEB',
            borderColor: safetyDeclaration ? '#86EFAC' : '#FCD34D'
          }}
        >
          <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
            <input
              type="checkbox"
              style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              checked={safetyDeclaration}
              onChange={(e) => setSafetyDeclaration(e.target.checked)}
              required
            />
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={16} style={{ color: 'var(--warning-dark)' }} />
                Mandatory Food Safety Declaration (BR-04)
              </span>
              <p style={{ fontSize: '0.825rem', color: '#4B5563', marginTop: '4px', lineHeight: 1.5 }}>
                "I confirm on behalf of {currentUser?.name} that this food was prepared hygienically, stored under temperature control, and is 100% safe to eat until the designated best-before time."
              </p>
              {errors.safetyDeclaration && (
                <span className="form-error" style={{ display: 'block', marginTop: '4px' }}>
                  {errors.safetyDeclaration}
                </span>
              )}
            </div>
          </label>
        </div>

        {/* Sticky Submit Button */}
        <div style={{ position: 'sticky', bottom: '1rem', zIndex: 10 }}>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', boxShadow: '0 8px 24px var(--primary-glow)', fontSize: '1.1rem' }}
          >
            <Sparkles size={20} />
            <span>Publish Food Donation & Notify Nearby Shelters</span>
          </button>
        </div>
      </form>
    </div>
  );
}
