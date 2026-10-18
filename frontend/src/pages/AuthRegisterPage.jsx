import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  UtensilsCrossed,
  HeartHandshake,
  Truck,
  CheckCircle2,
  ShieldCheck,
  FileText,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { storageService } from '../lib/storageService';

export default function AuthRegisterPage() {
  const { setCurrentUser, showToast } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [role, setRole] = useState('DONOR');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('482910');

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(code);
    setStep(2);
    showToast(`Verification code sent to ${phone}: ${code}`, 'info');
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (enteredOtp.trim() !== simulatedOtp) {
      showToast('Incorrect OTP. Try the simulated code shown above.', 'danger');
      return;
    }

    // Determine verification state based on role
    const needsAdminApproval = role === 'NGO';
    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      phone,
      role,
      type: role === 'DONOR' ? 'Food Donor' : role === 'NGO' ? 'NGO Shelter' : 'Volunteer Courier',
      verified: !needsAdminApproval,
      verificationStatus: needsAdminApproval ? 'PENDING' : 'APPROVED',
      city,
      address,
      darpanRegNo: role === 'NGO' ? regNumber : undefined,
      fssaiLicense: role === 'DONOR' ? regNumber : undefined,
      rating: 5.0,
      ratingCount: 1
    };

    const users = storageService.getUsers();
    users.push(newUser);
    localStorage.setItem('foodrescue_users_v1', JSON.stringify(users));

    setCurrentUser(newUser);
    showToast(`Account registered and verified! Welcome, ${newUser.name}.`, 'success');

    if (role === 'DONOR') navigate('/donor/dashboard');
    else if (role === 'NGO') navigate('/ngo/discover');
    else navigate('/volunteer/tasks');
  };

  return (
    <div style={{ maxWidth: '640px', margin: '2rem auto 4rem', padding: '0 1.25rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Join the Food Rescue Mission
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '2px' }}>
            Register as a Partner
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Step {step} of 2: {step === 1 ? 'Organization Details' : 'Contact OTP Verification (FR-AUTH-02)'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label">Select Your Role *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))', gap: '0.75rem' }}>
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.85rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${role === 'DONOR' ? 'var(--primary)' : 'var(--border)'}`,
                    background: role === 'DONOR' ? 'var(--primary-light)' : 'white',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="DONOR"
                    checked={role === 'DONOR'}
                    onChange={() => setRole('DONOR')}
                    style={{ display: 'none' }}
                  />
                  <UtensilsCrossed size={22} style={{ color: 'var(--primary-dark)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Food Donor</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Restaurant / Hotel</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.85rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${role === 'NGO' ? 'var(--info)' : 'var(--border)'}`,
                    background: role === 'NGO' ? 'var(--info-light)' : 'white',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="NGO"
                    checked={role === 'NGO'}
                    onChange={() => setRole('NGO')}
                    style={{ display: 'none' }}
                  />
                  <HeartHandshake size={22} style={{ color: 'var(--info-dark)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>NGO / Shelter</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Community Kitchen</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.85rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${role === 'VOLUNTEER' ? 'var(--accent)' : 'var(--border)'}`,
                    background: role === 'VOLUNTEER' ? 'var(--accent-light)' : 'white',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="VOLUNTEER"
                    checked={role === 'VOLUNTEER'}
                    onChange={() => setRole('VOLUNTEER')}
                    style={{ display: 'none' }}
                  />
                  <Truck size={22} style={{ color: 'var(--accent-dark)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Volunteer</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Courier / Driver</span>
                </label>
              </div>
            </div>

            {/* Basic Info */}
            <div className="form-group">
              <label className="form-label">
                {role === 'DONOR' ? 'Kitchen / Business Name *' : role === 'NGO' ? 'NGO / Shelter Name *' : 'Full Name *'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={role === 'DONOR' ? 'e.g. Royal Greens Banquet' : role === 'NGO' ? 'e.g. Seva Hunger Relief Trust' : 'e.g. Amit Verma'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid-responsive-2col">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="contact@org.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98111 22334"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Address / Area *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Street address, Colony, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            {role === 'NGO' && (
              <div className="form-group">
                <label className="form-label">NGO Darpan Registration / 80G Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. DL/2023/0481921"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  required
                />
                <span className="form-hint">Used for compliance verification by platform operators.</span>
              </div>
            )}

            {role === 'DONOR' && (
              <div className="form-group">
                <label className="form-label">FSSAI License / Registration No (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 10019011000542"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Create Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <span>Continue to Contact Verification</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleOtpVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ color: '#166534', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                6-Digit Verification Code
              </div>
              <p style={{ fontSize: '0.825rem', color: '#15803D' }}>
                We sent a confirmation code to <b>{phone}</b> and <b>{email}</b>.
              </p>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#14532D', letterSpacing: '0.2em', fontFamily: 'monospace', margin: '0.75rem 0' }}>
                {simulatedOtp}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#166534' }}>
                (Code simulated on-screen for interactive evaluation)
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center' }}>Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength="6"
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.25em' }}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Verify & Activate Account
              </button>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', margin: '1.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}
