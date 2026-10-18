import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  HeartHandshake,
  Bell,
  PlusCircle,
  Compass,
  Truck,
  ShieldCheck,
  BarChart3,
  User,
  CheckCircle,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export default function Header() {
  const { currentUser, logout, unreadNotifCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadgeClass = () => {
    switch (currentUser?.role) {
      case 'DONOR':
        return 'role-badge donor';
      case 'NGO':
        return 'role-badge ngo';
      case 'VOLUNTEER':
        return 'role-badge volunteer';
      case 'ADMIN':
        return 'role-badge admin';
      default:
        return 'role-badge';
    }
  };

  const isLinkActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon-wrapper">
            <HeartHandshake size={22} />
          </div>
          <span>Food<span style={{ color: 'var(--primary)' }}>Rescue</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          {/* Public / Common Links */}
          <Link to="/impact" className={`nav-link ${isLinkActive('/impact') ? 'active' : ''}`}>
            Impact
          </Link>
          <Link to="/how-it-works" className={`nav-link ${isLinkActive('/how-it-works') ? 'active' : ''}`}>
            How It Works
          </Link>

          {/* Donor specific */}
          {currentUser?.role === 'DONOR' && (
            <>
              <Link to="/donor/dashboard" className={`nav-link ${isLinkActive('/donor/dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/donor/listings/new" className="btn btn-sm btn-primary" style={{ gap: '0.35rem' }}>
                <PlusCircle size={16} /> Donate Food
              </Link>
            </>
          )}

          {/* NGO specific */}
          {currentUser?.role === 'NGO' && (
            <>
              <Link to="/ngo/discover" className={`nav-link ${isLinkActive('/ngo/discover') ? 'active' : ''}`}>
                <Compass size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Discover Food
              </Link>
              <Link to="/ngo/claims" className={`nav-link ${isLinkActive('/ngo/claims') ? 'active' : ''}`}>
                My Claims
              </Link>
            </>
          )}

          {/* Volunteer specific */}
          {currentUser?.role === 'VOLUNTEER' && (
            <>
              <Link to="/volunteer/tasks" className={`nav-link ${isLinkActive('/volunteer/tasks') ? 'active' : ''}`}>
                <Truck size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Tasks & Deliveries
              </Link>
            </>
          )}

          {/* Admin specific */}
          {currentUser?.role === 'ADMIN' && (
            <>
              <Link to="/admin/overview" className={`nav-link ${isLinkActive('/admin/overview') ? 'active' : ''}`}>
                <BarChart3 size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Admin Console
              </Link>
              <Link to="/admin/verifications" className={`nav-link ${isLinkActive('/admin/verifications') ? 'active' : ''}`}>
                Verifications
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          {currentUser ? (
            <>
              {/* Notifications Bell */}
              <Link
                to="/notifications"
                className="btn btn-ghost"
                style={{ position: 'relative', padding: '0.45rem', minHeight: '38px', borderRadius: 'var(--radius-full)' }}
                title="Notifications"
              >
                <Bell size={20} />
                {unreadNotifCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'var(--danger)',
                      color: 'white',
                      borderRadius: 'var(--radius-full)',
                      width: '18px',
                      height: '18px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 0 2px white'
                    }}
                  >
                    {unreadNotifCount}
                  </span>
                )}
              </Link>

              {/* Current User Pill */}
              <Link
                to="/profile"
                className={getRoleBadgeClass()}
                style={{ textDecoration: 'none', cursor: 'pointer' }}
                title="View Profile"
              >
                <User size={13} />
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser?.name?.split(' ')[0]}
                </span>
                {currentUser?.verified && (
                  <CheckCircle size={13} style={{ color: 'var(--primary)' }} />
                )}
              </Link>

              {/* Sign Out Button */}
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '0.4rem', color: '#6B7280' }}
                onClick={handleLogout}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-ghost" style={{ fontSize: '0.875rem' }}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary" style={{ fontSize: '0.875rem' }}>
                Register
              </Link>
            </>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <nav className="mobile-nav-list">
            <Link
              to="/impact"
              className={`mobile-nav-link ${isLinkActive('/impact') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Impact
            </Link>
            <Link
              to="/how-it-works"
              className={`mobile-nav-link ${isLinkActive('/how-it-works') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>

            <div className="mobile-nav-divider" />

            {/* If Logged In: Role Specific Links */}
            {currentUser ? (
              <>
                {currentUser?.role === 'DONOR' && (
                  <>
                    <Link
                      to="/donor/dashboard"
                      className={`mobile-nav-link ${isLinkActive('/donor/dashboard') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/donor/listings"
                      className={`mobile-nav-link ${isLinkActive('/donor/listings') && location.pathname === '/donor/listings' ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Listings
                    </Link>
                    <Link
                      to="/donor/listings/new"
                      className="btn btn-sm btn-primary"
                      style={{ justifyContent: 'center', marginTop: '0.25rem' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PlusCircle size={16} /> Donate Food
                    </Link>
                  </>
                )}

                {currentUser?.role === 'NGO' && (
                  <>
                    <Link
                      to="/ngo/discover"
                      className={`mobile-nav-link ${isLinkActive('/ngo/discover') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Compass size={16} /> Discover Food
                    </Link>
                    <Link
                      to="/ngo/claims"
                      className={`mobile-nav-link ${isLinkActive('/ngo/claims') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Claims
                    </Link>
                  </>
                )}

                {currentUser?.role === 'VOLUNTEER' && (
                  <>
                    <Link
                      to="/volunteer/tasks"
                      className={`mobile-nav-link ${isLinkActive('/volunteer/tasks') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Truck size={16} /> Tasks & Deliveries
                    </Link>
                  </>
                )}

                {currentUser?.role === 'ADMIN' && (
                  <>
                    <Link
                      to="/admin/overview"
                      className={`mobile-nav-link ${isLinkActive('/admin/overview') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BarChart3 size={16} /> Admin Console
                    </Link>
                    <Link
                      to="/admin/verifications"
                      className={`mobile-nav-link ${isLinkActive('/admin/verifications') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShieldCheck size={16} /> Verifications Queue
                    </Link>
                    <Link
                      to="/admin/settings"
                      className={`mobile-nav-link ${isLinkActive('/admin/settings') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Platform Settings
                    </Link>
                    <Link
                      to="/admin/audit"
                      className={`mobile-nav-link ${isLinkActive('/admin/audit') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Audit Logs
                    </Link>
                  </>
                )}

                <div className="mobile-nav-divider" />

                <Link
                  to="/profile"
                  className={`mobile-nav-link ${isLinkActive('/profile') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={16} /> Profile ({currentUser?.name?.split(' ')[0]})
                </Link>

                <button
                  type="button"
                  className="mobile-nav-link"
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', color: 'var(--danger-dark)' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  style={{ justifyContent: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
