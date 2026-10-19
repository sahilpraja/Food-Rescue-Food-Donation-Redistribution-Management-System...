import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  UtensilsCrossed,
  Clock,
  ArrowLeft,
  Check,
  AlertCircle,
  Save,
  Trash2
} from 'lucide-react';
import { CATEGORIES, DIET_TYPES } from '../../lib/utils';

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings, currentUser, updateListing, deleteListing, loading } = useApp();

  const listing = listings.find((l) => String(l.id) === String(id));

  const ALLERGEN_OPTIONS = ['Dairy', 'Gluten', 'Nuts / Peanuts', 'Soy', 'Eggs', 'Mustard'];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [dietType, setDietType] = useState('VEG');
  const [quantity, setQuantity] = useState(40);
  const [unit, setUnit] = useState('portions');
  const [packaging, setPackaging] = useState('');
  const [preparedAt, setPreparedAt] = useState('');
  const [bestBefore, setBestBefore] = useState('');
  const [pickupFrom, setPickupFrom] = useState('');
  const [pickupTo, setPickupTo] = useState('');
  const [allergens, setAllergens] = useState([]);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (listing) {
      setTitle(listing.title || '');
      setCategory(listing.category || 'Cooked Meals');
      setDietType(listing.dietType || 'VEG');
      setQuantity(listing.quantity || 10);
      setUnit(listing.unit || 'portions');
      setPackaging(listing.packaging || '');
      setPreparedAt(listing.preparedAt ? new Date(listing.preparedAt).toISOString().slice(0, 16) : '');
      setBestBefore(listing.bestBefore ? new Date(listing.bestBefore).toISOString().slice(0, 16) : '');
      setPickupFrom(listing.pickupFrom ? new Date(listing.pickupFrom).toISOString().slice(0, 16) : '');
      setPickupTo(listing.pickupTo ? new Date(listing.pickupTo).toISOString().slice(0, 16) : '');
      setAllergens(Array.isArray(listing.allergens) ? listing.allergens : []);
      setNotes(listing.notes || '');
      setPhotoUrl(listing.photos?.[0] || '');
    }
  }, [listing]);

  if (!listing) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <h2>Listing Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>The requested listing was not found or was removed.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/donor/listings')}>
          Back to My Listings
        </button>
      </div>
    );
  }

  const isOwnerOrAdmin = listing.donorId === currentUser?.id || currentUser?.role === 'ADMIN';
  if (!isOwnerOrAdmin) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <h2>Unauthorized</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>You do not have permission to edit this listing.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/donor/listings')}>
          Back to My Listings
        </button>
      </div>
    );
  }

  const toggleAllergen = (item) => {
    if (allergens.includes(item)) {
      setAllergens(allergens.filter((a) => a !== item));
    } else {
      setAllergens([...allergens, item]);
    }
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!quantity || Number(quantity) <= 0) errs.quantity = 'Quantity must be greater than 0';

    if (preparedAt && bestBefore) {
      const prepTime = new Date(preparedAt).getTime();
      const expiryTime = new Date(bestBefore).getTime();
      if (expiryTime <= prepTime) {
        errs.bestBefore = 'Best-before time must be later than prepared-at time.';
      }
      if (pickupTo) {
        const pickupEndTime = new Date(pickupTo).getTime();
        if (pickupEndTime > expiryTime) {
          errs.pickupTo = 'Pickup window must end before best-before expiry time.';
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateListing(listing.id, {
        title,
        category,
        dietType,
        quantity: Number(quantity),
        unit,
        packaging,
        preparedAt: preparedAt ? new Date(preparedAt).toISOString() : listing.preparedAt,
        bestBefore: bestBefore ? new Date(bestBefore).toISOString() : listing.bestBefore,
        pickupFrom: pickupFrom ? new Date(pickupFrom).toISOString() : listing.pickupFrom,
        pickupTo: pickupTo ? new Date(pickupTo).toISOString() : listing.pickupTo,
        allergens,
        notes,
        photos: photoUrl ? [photoUrl] : listing.photos
      });
      navigate(`/donor/listings/${listing.id}`);
    } catch (err) {
      // Error handled by toast in AppContext
    }
  };

  const handleDelete = async () => {
    try {
      await deleteListing(listing.id);
      navigate('/donor/listings');
    } catch (err) {
      // Error handled by toast
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(-1)}
          style={{ gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => setDeleteConfirmOpen(true)}
          style={{ gap: '6px' }}
        >
          <Trash2 size={16} />
          <span>Delete / Cancel Offer</span>
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
          Edit Donation #{listing.id}
        </span>
        <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.85rem)', fontWeight: 800, marginTop: '2px' }}>Update Food Listing</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Update quantity, expiry time, notes, and packaging details for your active surplus donation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Title */}
        <div className="form-group">
          <label className="form-label">Food Title / Description *</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          {errors.title && <span style={{ color: 'var(--danger-dark)', fontSize: '0.8rem' }}>{errors.title}</span>}
        </div>

        {/* Category & Diet */}
        <div className="grid-responsive-2col">
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Dietary Type *</label>
            <select className="form-select" value={dietType} onChange={(e) => setDietType(e.target.value)}>
              {DIET_TYPES.filter((d) => d.id !== 'ALL').map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity and Unit */}
        <div className="grid-responsive-2col">
          <div className="form-group">
            <label className="form-label">Quantity Available *</label>
            <input
              type="number"
              min="1"
              className="form-input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            {errors.quantity && <span style={{ color: 'var(--danger-dark)', fontSize: '0.8rem' }}>{errors.quantity}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Unit *</label>
            <select className="form-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="portions">Portions / Meals</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="boxes">Food Boxes</option>
            </select>
          </div>
        </div>

        {/* Packaging */}
        <div className="form-group">
          <label className="form-label">Packaging Type</label>
          <input
            type="text"
            className="form-input"
            value={packaging}
            onChange={(e) => setPackaging(e.target.value)}
            placeholder="e.g. Disposable eco trays, stainless canisters"
          />
        </div>

        {/* Prepared At and Best Before */}
        <div className="grid-responsive-2col">
          <div className="form-group">
            <label className="form-label">Prepared At</label>
            <input
              type="datetime-local"
              className="form-input"
              value={preparedAt}
              onChange={(e) => setPreparedAt(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Best Before (Expiry) *</label>
            <input
              type="datetime-local"
              className="form-input"
              value={bestBefore}
              onChange={(e) => setBestBefore(e.target.value)}
              required
            />
            {errors.bestBefore && <span style={{ color: 'var(--danger-dark)', fontSize: '0.8rem' }}>{errors.bestBefore}</span>}
          </div>
        </div>

        {/* Pickup Window */}
        <div className="grid-responsive-2col">
          <div className="form-group">
            <label className="form-label">Pickup Window Opens</label>
            <input
              type="datetime-local"
              className="form-input"
              value={pickupFrom}
              onChange={(e) => setPickupFrom(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pickup Window Closes</label>
            <input
              type="datetime-local"
              className="form-input"
              value={pickupTo}
              onChange={(e) => setPickupTo(e.target.value)}
            />
            {errors.pickupTo && <span style={{ color: 'var(--danger-dark)', fontSize: '0.8rem' }}>{errors.pickupTo}</span>}
          </div>
        </div>

        {/* Allergens */}
        <div className="form-group">
          <label className="form-label">Allergens Present</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {ALLERGEN_OPTIONS.map((item) => {
              const selected = allergens.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleAllergen(item)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.825rem',
                    border: '1px solid',
                    borderColor: selected ? 'var(--primary)' : 'var(--border)',
                    background: selected ? 'var(--primary-light)' : 'white',
                    color: selected ? 'var(--primary-dark)' : 'var(--text-main)',
                    cursor: 'pointer'
                  }}
                >
                  {selected && '✓ '} {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">Storage / Handling Notes</label>
          <textarea
            className="form-textarea"
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} style={{ flex: '1 1 auto', minWidth: '120px' }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: '6px', flex: '1 1 auto', minWidth: '120px' }}>
            <Save size={16} />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger-dark)', marginBottom: '0.5rem' }}>
              Confirm Deletion / Cancellation
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Are you sure you want to remove <b>"{listing.title}"</b>? This will cancel the offer and notify interested shelters.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteConfirmOpen(false)}>
                Keep Listing
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Yes, Delete Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
