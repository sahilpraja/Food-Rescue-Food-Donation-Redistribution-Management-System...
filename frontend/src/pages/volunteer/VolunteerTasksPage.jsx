import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';
import {
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  Package,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Compass
} from 'lucide-react';
import { formatDateTime, calculateDistanceKm } from '../../lib/utils';

export default function VolunteerTasksPage() {
  const { listings, currentUser, volunteerAcceptTask, showToast } = useApp();
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' or 'MINE'

  // Open delivery tasks waiting for a volunteer
  const openTasks = listings.filter(
    (l) => l.claim?.pickupMode === 'VOLUNTEER' && l.deliveryTask?.status === 'OPEN'
  );

  // Tasks assigned to current volunteer
  const myAssignedTasks = listings.filter(
    (l) => l.deliveryTask?.volunteerId === currentUser?.id
  );

  const handleAccept = (listingId) => {
    try {
      volunteerAcceptTask(listingId);
      navigate(`/volunteer/tasks/${listingId}`);
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      {/* Top Banner with Availability Toggle */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Volunteer Courier Hub
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '2px' }}>
            Nearby Food Transport Tasks
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Help move surplus meals from busy commercial kitchens to community shelters.
          </p>
        </div>

        {/* Availability Switch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'white',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isAvailable ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
            {isAvailable ? '🟢 Available for Tasks' : '⚪ Offline'}
          </span>
          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            style={{ color: isAvailable ? 'var(--primary)' : '#9CA3AF', cursor: 'pointer' }}
          >
            {isAvailable ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`chip ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          Open Tasks ({openTasks.length})
        </button>
        <button
          type="button"
          className={`chip ${activeTab === 'MINE' ? 'active' : ''}`}
          onClick={() => setActiveTab('MINE')}
        >
          My Active & Past Tasks ({myAssignedTasks.length})
        </button>
      </div>

      {activeTab === 'ALL' ? (
        openTasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <Compass size={40} style={{ color: 'var(--text-light)', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Open Delivery Tasks</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0.5rem auto' }}>
              All current surplus claims have been assigned to couriers or picked up. We'll notify you as soon as a shelter requests volunteer transport!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {openTasks.map((item) => (
              <div
                key={item.id}
                className="card card-hoverable"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1.25rem',
                  borderLeft: '4px solid var(--accent)'
                }}
              >
                {/* Left: Food & Transport route */}
                <div style={{ display: 'flex', gap: '0.85rem', flex: '1 1 min(280px, 100%)', minWidth: 0 }}>
                  <img
                    src={item.photos?.[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    style={{ width: '85px', height: '85px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-dark)', background: 'var(--accent-light)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                        READY FOR PICKUP
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {item.quantity} {item.unit} (~{item.weightKg} kg)
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                      {item.title}
                    </h3>

                    <div style={{ fontSize: '0.825rem', color: 'var(--text-body)' }}>
                      <b>From:</b> {item.donorName} ({item.approxLocation})
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-body)' }}>
                      <b>To:</b> {item.claim?.ngoName}
                    </div>
                  </div>
                </div>

                {/* Right: Accept Button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0, width: 'auto' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--danger-dark)', fontWeight: 600 }}>
                    ⏰ Best before: {formatDateTime(item.bestBefore)}
                  </div>
                  <button
                    type="button"
                    className="btn btn-accent"
                    onClick={() => handleAccept(item.id)}
                    style={{ minWidth: '160px' }}
                  >
                    <Truck size={18} />
                    <span>Accept Task</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* My Assigned Tasks */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {myAssignedTasks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <h3>No Assigned Tasks</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Accept an open task from the list above to get started.</p>
            </div>
          ) : (
            myAssignedTasks.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  borderLeft: `4px solid ${item.status === 'COMPLETED' ? 'var(--primary)' : 'var(--info)'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <StatusBadge status={item.status} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.title}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    Move {item.quantity} {item.unit} to {item.claim?.ngoName}
                  </h4>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Pickup: {item.address?.line1 || item.donorName}
                  </div>
                </div>

                <Link to={`/volunteer/tasks/${item.id}`} className="btn btn-primary btn-sm" style={{ gap: '4px' }}>
                  <span>{item.status === 'COMPLETED' ? 'View Details' : 'Continue Delivery'}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
