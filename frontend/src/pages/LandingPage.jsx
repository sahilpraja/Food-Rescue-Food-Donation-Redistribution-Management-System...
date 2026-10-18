import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  UtensilsCrossed,
  HeartHandshake,
  Truck,
  ShieldCheck,
  Clock,
  ArrowRight,
  MapPin,
  Leaf,
  Sparkles,
  Users,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

export default function LandingPage() {
  const { impactMetrics, currentUser, listings } = useApp();
  const navigate = useNavigate();

  const activeListingsCount = listings.filter((l) => l.status === 'ACTIVE').length;

  const handleDonateClick = () => {
    if (currentUser?.role === 'DONOR') {
      navigate('/donor/listings/new');
    } else if (currentUser) {
      navigate('/donor/dashboard');
    } else {
      navigate('/register?role=DONOR');
    }
  };

  const handleClaimClick = () => {
    navigate('/ngo/discover');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #F0FDF4 0%, #FAFAF7 100%)',
          padding: 'clamp(2rem, 6vw, 4rem) 1rem 2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          {/* Top Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              background: 'white',
              border: '1px solid #B8E7C8',
              borderRadius: 'var(--radius-full)',
              color: 'var(--primary-dark)',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            <span>Near Real-Time Food Redistribution System</span>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--text-main)' }}>
            Turn Surplus Food Into <span style={{ color: 'var(--primary)' }}>Hope</span>, Not Waste.
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-body)', maxWidth: '680px', lineHeight: 1.6 }}>
            Connecting restaurants, caterers, and hotels with verified NGOs and volunteer couriers in minutes — ensuring nutritious meals reach people before food spoils.
          </p>

          {/* Dual CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-lg btn-primary"
              onClick={handleDonateClick}
              style={{ gap: '0.65rem' }}
            >
              <UtensilsCrossed size={20} />
              <span>Donate Food Now</span>
            </button>
            <button
              type="button"
              className="btn btn-lg btn-secondary"
              onClick={handleClaimClick}
              style={{ gap: '0.65rem' }}
            >
              <HeartHandshake size={20} style={{ color: 'var(--primary)' }} />
              <span>Claim Food for Shelter ({activeListingsCount} Available)</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', fontSize: '0.825rem', color: 'var(--text-muted)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={15} style={{ color: 'var(--primary)' }} /> 100% Free
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={15} style={{ color: 'var(--primary)' }} /> FSSAI Guidelines Aligned
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={15} style={{ color: 'var(--primary)' }} /> &lt; 20 min Avg Claim Time
            </span>
          </div>
        </div>
      </section>

      {/* Live Impact Counters Strip */}
      <section style={{ maxWidth: '1200px', margin: '-1.5rem auto 0', padding: '0 1.25rem', width: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
            gap: '1.25rem',
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border)'
          }}
        >
          <div className="stat-card" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
            <div className="stat-icon" style={{ background: '#E8F8EE', color: '#1F7A44' }}>
              🍲
            </div>
            <div>
              <div className="stat-val">{impactMetrics.totalMealsRedistributed.toLocaleString()}</div>
              <div className="stat-label">Meals Served to Shelters</div>
            </div>
          </div>

          <div className="stat-card" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
            <div className="stat-icon" style={{ background: '#FEF3E8', color: '#D97316' }}>
              ⚖️
            </div>
            <div>
              <div className="stat-val">{impactMetrics.totalKgSaved.toLocaleString()} kg</div>
              <div className="stat-label">Edible Food Diverted from Landfills</div>
            </div>
          </div>

          <div className="stat-card" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
            <div className="stat-icon" style={{ background: '#EBF3FD', color: '#1C65C9' }}>
              🌱
            </div>
            <div>
              <div className="stat-val">{impactMetrics.co2eAvoidedKg.toLocaleString()} kg</div>
              <div className="stat-label">Estimated CO₂e Emissions Avoided</div>
            </div>
          </div>

          <div className="stat-card" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
            <div className="stat-icon" style={{ background: '#F3E8FF', color: '#7E22CE' }}>
              🤝
            </div>
            <div>
              <div className="stat-val">{impactMetrics.successRatePercent}%</div>
              <div className="stat-label">Pickup & Delivery Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.25rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>How Food Rescue Works</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto' }}>
            Built for speed under time pressure. From a busy restaurant kitchen to a shelter dining hall in 3 simple steps.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.5rem' }}>
          {/* Step 1 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--primary)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
              1
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Donor Lists Surplus in &lt; 2 Mins</h3>
            <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Select food type, portion count, safe prepared/best-before window, snap a photo, and acknowledge our mandatory food safety pledge.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: 600 }}>Privacy Protected:</span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Exact address is kept private until claim acceptance.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--info)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--info-light)', color: 'var(--info-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
              2
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Verified NGO Claims Nearby</h3>
            <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Registered shelters discover food via interactive map or list with live expiry countdowns. Claim instantly and choose Self-Collection or Volunteer Courier.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--info-dark)', fontWeight: 600 }}>Zero Double-Claims:</span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Atomic locking ensures only one claim succeeds at a time.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--accent)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--accent-light)', color: 'var(--accent-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
              3
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>OTP Handover & Impact Tracking</h3>
            <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Secure 6-digit OTP codes verify both pickup at the kitchen and drop-off at the shelter. Meals and environmental savings are logged immediately.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-dark)', fontWeight: 600 }}>Full Traceability:</span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Every state change logged with timestamps and actors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved / Participation Cards */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.25rem', width: '100%' }}>
        <div style={{ background: '#F8FAF8', borderRadius: 'var(--radius-xl)', padding: '2.5rem 1.5rem', border: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Join the Movement
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem' }}>Get Involved with Food Rescue</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Choose how you want to participate in eliminating hunger and food waste in your city.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: '1.25rem' }}>
            {/* Donor */}
            <div className="card" style={{ background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E8F8EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1F7A44' }}>
                  <UtensilsCrossed size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Food Donor</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Restaurants, Banquets, Hotels</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: '1.25rem' }}>
                Create surplus listings under 2 minutes, approve claims, and generate pickup handover codes.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
                onClick={() => navigate(currentUser ? '/donor/dashboard' : '/register?role=DONOR')}
              >
                {currentUser?.role === 'DONOR' ? 'Go to Dashboard' : 'Register as Donor'}
              </button>
            </div>

            {/* NGO */}
            <div className="card" style={{ background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C65C9' }}>
                  <HeartHandshake size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Verified NGO</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shelters, Food Banks, Kitchens</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: '1.25rem' }}>
                Browse live interactive map, filter by dietary requirements, claim food, and track arrival.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', borderColor: 'var(--info)', color: 'var(--info-dark)' }}
                onClick={() => navigate(currentUser ? '/ngo/discover' : '/register?role=NGO')}
              >
                {currentUser?.role === 'NGO' ? 'Discover Food' : 'Register Shelter'}
              </button>
            </div>

            {/* Volunteer */}
            <div className="card" style={{ background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97316' }}>
                  <Truck size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Courier Volunteer</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Community Food Couriers</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: '1.25rem' }}>
                Accept open delivery tasks in your radius, navigate to donor, and confirm OTP handovers.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', borderColor: 'var(--accent)', color: 'var(--accent-dark)' }}
                onClick={() => navigate(currentUser ? '/volunteer/tasks' : '/register?role=VOLUNTEER')}
              >
                {currentUser?.role === 'VOLUNTEER' ? 'View Tasks' : 'Sign Up as Courier'}
              </button>
            </div>

            {/* Admin */}
            <div className="card" style={{ background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7E22CE' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Platform Admin</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Safety, Moderation & Audit</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: '1.25rem' }}>
                Approve NGO registrations, moderate safety reports, manage system parameters & audit logs.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', borderColor: '#A855F7', color: '#7E22CE' }}
                onClick={() => navigate(currentUser?.role === 'ADMIN' ? '/admin/overview' : '/login')}
              >
                {currentUser?.role === 'ADMIN' ? 'Admin Console' : 'Administrator Sign In'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
