import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  HeartHandshake,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  KeyRound,
  ArrowRight
} from 'lucide-react';

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState('DONOR');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
          Step-by-Step Architecture
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px' }}>
          How Food Rescue Works
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>
          Explore the lifecycle of a food donation from preparation in a commercial kitchen to distribution at a verified shelter.
        </p>
      </div>

      {/* Role Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          className={`chip ${activeTab === 'DONOR' ? 'active' : ''}`}
          onClick={() => setActiveTab('DONOR')}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
        >
          For Food Donors
        </button>
        <button
          type="button"
          className={`chip ${activeTab === 'NGO' ? 'active' : ''}`}
          onClick={() => setActiveTab('NGO')}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
        >
          For Verified NGOs
        </button>
        <button
          type="button"
          className={`chip ${activeTab === 'VOLUNTEER' ? 'active' : ''}`}
          onClick={() => setActiveTab('VOLUNTEER')}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
        >
          For Volunteer Couriers
        </button>
      </div>

      {/* Role specific detailed breakdown */}
      {activeTab === 'DONOR' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E8F8EE', color: '#1F7A44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              1
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Quick 2-Minute Listing</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '4px' }}>
                At the end of service or lunch catering, post surplus portions with prepared-at and best-before times. Confirm our short food safety declaration. Your exact kitchen address remains private at this stage.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EBF3FD', color: '#1C65C9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              2
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Review & Accept Claim in 10 Minutes</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '4px' }}>
                When an NGO requests your food, you receive an instant alert. Accept the claim to unlock your exact address and contact details to the verified receiver.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FEF3E8', color: '#D97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              3
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Show 6-Digit Pickup Handover OTP</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '4px' }}>
                When the courier or NGO driver arrives at your back door, show the 6-digit code on your screen. Entering it into their app confirms handover and protects you from false claims.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'NGO' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E8F8EE', color: '#1F7A44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              1
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Upload NGO Registration & Get Verified</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '4px' }}>
                Upload your Darpan ID or NGO Trust registration certificate. Admins approve credentials to guarantee all food reaches legitimate community kitchens.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EBF3FD', color: '#1C65C9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              2
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Discover on Live Map & Claim</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '4px' }}>
                Filter nearby listings by vegetarian / non-veg requirements and urgency. Claim in one tap and choose between Self-Collection or requesting a Volunteer Courier.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FEF3E8', color: '#D97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              3
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Show Delivery OTP on Arrival</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '4px' }}>
                Upon delivery, show your 6-digit delivery OTP to the courier. Once entered, the donation is marked complete and impact metrics update in real time.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'VOLUNTEER' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FEF3E8', color: '#D97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              1
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Turn On Availability & Browse Tasks</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '4px' }}>
                Toggle your courier status to available and view transport requests with pickup/drop locations, portions, and time windows.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E8F8EE', color: '#1F7A44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              2
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Accept Task & Enter Pickup OTP</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '4px' }}>
                Navigate to the restaurant, verify the meal boxes, and input the donor's 6-digit code. The status updates to In-Transit so the shelter knows you are on the way.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EBF3FD', color: '#1C65C9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              3
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Deliver to Shelter & Enter Drop-off OTP</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '4px' }}>
                Hand over the food to shelter staff and input their delivery OTP to complete the mission and log your volunteer hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Safety & Compliance strip */}
      <div style={{ background: '#F8FAF8', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
            <span>FSSAI Food Safety & DPDP Privacy Framework Aligned</span>
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Food safety pledges, strict temperature windows, immutable audit trails, and privacy by default.
          </p>
        </div>

        <Link to="/impact" className="btn btn-primary btn-sm">
          View Platform Impact
        </Link>
      </div>
    </div>
  );
}
