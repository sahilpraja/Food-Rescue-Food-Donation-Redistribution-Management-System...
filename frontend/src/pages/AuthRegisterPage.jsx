import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  UtensilsCrossed,
  HeartHandshake,
  Truck,
  ShieldCheck,
  CheckCircle2,
  FileText,
  KeyRound,
  ArrowRight,
  Lock
} from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function AuthRegisterPage() {
  const { register, googleAuth, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('role')?.toUpperCase() || 'DONOR';

  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [role, setRole] = useState(['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'].includes(initialRole) ? initialRole : 'DONOR');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('482910');
  const [submitting, setSubmitting] = useState(false);

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      showToast('Please fill in all mandatory fields.', 'danger');
      return;
    }

    if (role === 'ADMIN' && !adminSecret.trim()) {
      showToast('Admin Security Passcode is required to register an administrator account.', 'danger');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(code);
    setStep(2);
    showToast(`Verification code sent to ${phone}: ${code}`, 'info');
  };

  const handleGoogleAuth = async (googleData) => {
    if (role === 'ADMIN' && !adminSecret.trim()) {
      showToast('Please enter the Admin Security Passcode below before signing up with Google as Admin.', 'danger');
      return;
    }

    setSubmitting(true);
    const result = await googleAuth({
      ...googleData,
      role,
      adminSecret: role === 'ADMIN' ? adminSecret.trim() : undefined,
      phone: phone || '+91 98000 00000'
    });
    setSubmitting(false);

    if (result.success) {
      const user = result.user;
      showToast(`Welcome to Food Rescue, ${user.name}!`, 'success');
      if (user.role === 'DONOR') navigate('/donor/dashboard');
      else if (user.role === 'NGO') navigate('/ngo/discover');
      else if (user.role === 'VOLUNTEER') navigate('/volunteer/tasks');
      else if (user.role === 'ADMIN') navigate('/admin/overview');
      else navigate('/');
    } else {
      showToast(result.error || 'Google registration failed.', 'danger');
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (enteredOtp.trim() !== simulatedOtp) {
      showToast('Incorrect OTP. Try the simulated code shown above.', 'danger');
      return;
    }

    setSubmitting(true);
    const result = await register({
      name,
      email,
      phone,
      password,
      role,
      addressLine: address,
      city,
      darpanRegNo: role === 'NGO' ? regNumber : undefined,
      fssaiLicense: role === 'DONOR' ? regNumber : undefined,
      adminSecret: role === 'ADMIN' ? adminSecret.trim() : undefined
    });
    setSubmitting(false);

    if (result.success) {
      const user = result.user;
      showToast(`Account registered and verified! Welcome, ${user.name}.`, 'success');
      if (user.role === 'DONOR') navigate('/donor/dashboard');
      else if (user.role === 'NGO') navigate('/ngo/discover');
      else if (user.role === 'VOLUNTEER') navigate('/volunteer/tasks');
      else if (user.role === 'ADMIN') navigate('/admin/overview');
      else navigate('/');
    } else {
      showToast(result.error || 'Registration failed. Please check your credentials.', 'danger');
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '2rem auto 4rem', padding: '0 1.25rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Join the Food Rescue Mission
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '2px' }}>
            Register as a Partner
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Step {step} of 2: {step === 1 ? 'Organization & Account Details' : 'Contact OTP Verification (FR-AUTH-02)'}
          </p>
        </div>

        {step === 1 ? (
          <div>
            {/* Role Selection */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Select Your Role *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
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
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Food Donor</span>
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
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>NGO / Shelter</span>
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
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Volunteer</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Courier / Driver</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.85rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${role === 'ADMIN' ? '#7E22CE' : 'var(--border)'}`,
                    background: role === 'ADMIN' ? '#F3E8FF' : 'white',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="ADMIN"
                    checked={role === 'ADMIN'}
                    onChange={() => setRole('ADMIN')}
                    style={{ display: 'none' }}
                  />
                  <ShieldCheck size={22} style={{ color: '#7E22CE' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#6B21A8' }}>Platform Admin</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Passcode Required</span>
                </label>
              </div>
            </div>

            {/* Google Quick Sign-Up */}
            <div style={{ marginBottom: '1.25rem' }}>
              <GoogleAuthButton
                mode="register"
                selectedRole={role}
                adminSecret={adminSecret}
                onSuccess={handleGoogleAuth}
                onError={(msg) => showToast(msg, 'danger')}
                disabled={submitting}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Or complete with details
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Basic Info */}
              <div className="form-group">
                <label className="form-label">
                  {role === 'DONOR' ? 'Kitchen / Business Name *' : role === 'NGO' ? 'NGO / Shelter Name *' : role === 'ADMIN' ? 'Administrator Name *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={role === 'DONOR' ? 'e.g. Royal Greens Banquet' : role === 'NGO' ? 'e.g. Seva Hunger Relief Trust' : role === 'ADMIN' ? 'e.g. System Administrator' : 'e.g. Amit Verma'}
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

              {role === 'ADMIN' && (
                <div className="form-group" style={{ background: '#FAF5FF', border: '1.5px solid #D8B4FE', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <label className="form-label" style={{ color: '#6B21A8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={16} /> Admin Security Passcode *
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter platform admin registration passcode"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    required
                    style={{ borderColor: '#C084FC' }}
                  />
                  <span className="form-hint" style={{ color: '#7E22CE' }}>
                    Security verification required for administrator privileges. Default passcode: <code>FOODRESCUE_ADMIN_2025</code>
                  </span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Create Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="At least 6 characters"
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
          </div>
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
                disabled={submitting}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                {submitting ? 'Activating Account...' : 'Verify & Activate Account'}
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
