import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import StatusBadge from '../../components/StatusBadge';
import TrackingTimeline from '../../components/TrackingTimeline';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  KeyRound,
  CheckCircle2,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Heart
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export default function TaskDeliveryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings, volunteerVerifyPickupOtp, volunteerVerifyDeliveryOtp, volunteerCancelTask, showToast } = useApp();

  const [enteredPickupOtp, setEnteredPickupOtp] = useState('');
  const [enteredDeliveryOtp, setEnteredDeliveryOtp] = useState('');
  const [pickupError, setPickupError] = useState('');
  const [deliveryError, setDeliveryError] = useState('');
  const [unassignModalOpen, setUnassignModalOpen] = useState(false);
  const [unassignReason, setUnassignReason] = useState('');

  const listing = listings.find((l) => String(l.id) === String(id));

  if (!listing || !listing.deliveryTask) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <h2>Task Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>This task may have been reassigned or completed.</p>
        <Link to="/volunteer/tasks" className="btn btn-primary">Back to Task List</Link>
      </div>
    );
  }

  const task = listing.deliveryTask;
  const isPickedUp = task.status === 'PICKED_UP' || listing.status === 'IN_TRANSIT';
  const isDelivered = task.status === 'DELIVERED' || listing.status === 'COMPLETED';

  // Handle Pickup OTP submit (FR-DEL-03)
  const handleVerifyPickup = (e) => {
    e.preventDefault();
    setPickupError('');
    try {
      volunteerVerifyPickupOtp(listing.id, enteredPickupOtp);
      setEnteredPickupOtp('');
    } catch (err) {
      setPickupError(err.message);
    }
  };

  // Handle Delivery OTP submit (FR-DEL-04)
  const handleVerifyDelivery = (e) => {
    e.preventDefault();
    setDeliveryError('');
    try {
      volunteerVerifyDeliveryOtp(listing.id, enteredDeliveryOtp);
      setEnteredDeliveryOtp('');
      // Trigger festive celebration confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setDeliveryError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/volunteer/tasks')}
          style={{ gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Tasks</span>
        </button>
      </div>

      {/* Task Summary Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <StatusBadge status={listing.status} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Task #{task.taskId?.slice(-6)}
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
              {listing.title}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginTop: '2px' }}>
              Transporting <b>{listing.quantity} {listing.unit}</b> (~{listing.weightKg} kg)
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Best Before</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--danger-dark)' }}>
              {formatDateTime(listing.bestBefore)}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Step-by-Step Delivery Action Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Step 1: Donor Kitchen Pickup */}
        <div
          className="card"
          style={{
            borderColor: !isPickedUp && !isDelivered ? 'var(--primary)' : 'var(--border)',
            background: !isPickedUp && !isDelivered ? '#F0FDF4' : 'white',
            boxShadow: !isPickedUp && !isDelivered ? 'var(--shadow-md)' : 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: isPickedUp ? 'var(--primary)' : '#1F2937', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                {isPickedUp ? '✓' : '1'}
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Step 1: Pick Up Food from Donor
              </h3>
            </div>
            {isPickedUp && (
              <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> Picked Up
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
            <div>
              <b>Donor: </b> {listing.donorName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span><b>Address: </b> {listing.address?.line1}, {listing.address?.city}</span>
            </div>
            {listing.donorPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span><b>Phone: </b> <a href={`tel:${listing.donorPhone}`} style={{ color: 'var(--info-dark)' }}>{listing.donorPhone}</a></span>
              </div>
            )}
          </div>

          {!isPickedUp && !isDelivered ? (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <KeyRound size={16} /> Enter Donor's 6-Digit Pickup OTP (FR-DEL-03)
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Ask the kitchen staff for the 6-digit code shown on their screen to confirm physical handover.
              </p>

              <form onSubmit={handleVerifyPickup} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', maxWidth: '380px' }}>
                <input
                  type="text"
                  maxLength="6"
                  className="form-input"
                  placeholder="e.g. 849201"
                  style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.2em', flex: '1 1 180px' }}
                  value={enteredPickupOtp}
                  onChange={(e) => setEnteredPickupOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap', flex: '1 1 auto' }}>
                  Verify Pickup
                </button>
              </form>

              {pickupError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.825rem', marginTop: '0.5rem', fontWeight: 600 }}>
                  ⚠️ {pickupError}
                </div>
              )}



              <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', textAlign: 'right' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger-dark)', fontSize: '0.8rem' }}
                  onClick={() => setUnassignModalOpen(true)}
                >
                  Can't complete this pickup? Release task
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Step 2: Transit & NGO Shelter Drop-off */}
        <div
          className="card"
          style={{
            borderColor: isPickedUp && !isDelivered ? 'var(--info)' : 'var(--border)',
            background: isPickedUp && !isDelivered ? '#EFF6FF' : 'white',
            boxShadow: isPickedUp && !isDelivered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            opacity: !isPickedUp && !isDelivered ? 0.7 : 1
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: isDelivered ? 'var(--primary)' : isPickedUp ? 'var(--info)' : '#9CA3AF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                {isDelivered ? '✓' : '2'}
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Step 2: Deliver to Shelter & Handover
              </h3>
            </div>
            {isDelivered && (
              <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> Completed
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
            <div>
              <b>Destination NGO: </b> {listing.claim?.ngoName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} style={{ color: 'var(--info)', flexShrink: 0 }} />
              <span><b>Drop-off Location: </b> Paharganj Shelter & Community Care Center, New Delhi</span>
            </div>
            {listing.claim?.ngoPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={16} style={{ color: 'var(--info)', flexShrink: 0 }} />
                <span><b>NGO Phone: </b> <a href={`tel:${listing.claim.ngoPhone}`} style={{ color: 'var(--info-dark)' }}>{listing.claim.ngoPhone}</a></span>
              </div>
            )}
          </div>

          {isPickedUp && !isDelivered ? (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1E40AF', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <KeyRound size={16} /> Enter Shelter Representative's Delivery OTP (FR-DEL-04)
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Ask the shelter coordinator for the 6-digit delivery OTP shown on their screen to complete task.
              </p>

              <form onSubmit={handleVerifyDelivery} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', maxWidth: '380px' }}>
                <input
                  type="text"
                  maxLength="6"
                  className="form-input"
                  placeholder="e.g. 392018"
                  style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.2em', flex: '1 1 180px' }}
                  value={enteredDeliveryOtp}
                  onChange={(e) => setEnteredDeliveryOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap', flex: '1 1 auto' }}>
                  Verify Delivery
                </button>
              </form>

              {deliveryError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.825rem', marginTop: '0.5rem', fontWeight: 600 }}>
                  ⚠️ {deliveryError}
                </div>
              )}


            </div>
          ) : null}
        </div>

        {/* Step 3: Success Celebration Banner */}
        {isDelivered && (
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
              border: '2px solid #86EFAC',
              textAlign: 'center',
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              🎉
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#14532D', margin: 0 }}>
              Food Rescued & Delivered Successfully!
            </h2>
            <p style={{ color: '#166534', fontSize: '0.95rem', maxWidth: '480px' }}>
              You saved <b>{listing.quantity} {listing.unit}</b> from going to waste, avoiding an estimated <b>{Math.round((listing.weightKg || 15) * 2.5)} kg of CO₂e</b>!
            </p>

            <Link to="/volunteer/tasks" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Find Another Task
            </Link>
          </div>
        )}

        {/* Tracking Timeline */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem' }}>
            Live Task History
          </h3>
          <TrackingTimeline listing={listing} />
        </div>
      </div>

      {/* Unassign Modal */}
      {unassignModalOpen && (
        <div className="modal-overlay" onClick={() => setUnassignModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger-dark)', marginBottom: '0.5rem' }}>
              Release Delivery Assignment
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              If you can no longer deliver <b>"{listing.title}"</b>, you can release the assignment back to the open volunteer pool so another courier can transport the meals.
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await volunteerCancelTask(listing.id, unassignReason);
              setUnassignModalOpen(false);
              navigate('/volunteer/tasks');
            }}>
              <div className="form-group">
                <label className="form-label">Reason for Releasing (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Vehicle issue, emergency, heavy rain"
                  value={unassignReason}
                  onChange={(e) => setUnassignReason(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setUnassignModalOpen(false)}>
                  Keep Task
                </button>
                <button type="submit" className="btn btn-danger">
                  Release Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
