import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  Compass,
  PackageOpen,
  Truck,
  ShieldAlert,
  Bell,
  User,
  BarChart3
} from 'lucide-react';

export default function MobileBottomNav() {
  const { currentUser, unreadNotifCount } = useApp();
  const role = currentUser?.role;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      {role === 'DONOR' && (
        <>
          <NavLink to="/donor/dashboard" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/donor/listings/new" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <PlusCircle size={22} style={{ color: 'var(--primary)' }} />
            <span>Donate</span>
          </NavLink>
          <NavLink to="/donor/listings" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <PackageOpen size={20} />
            <span>My Offers</span>
          </NavLink>
        </>
      )}

      {role === 'NGO' && (
        <>
          <NavLink to="/ngo/discover" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <Compass size={20} />
            <span>Discover</span>
          </NavLink>
          <NavLink to="/ngo/claims" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <PackageOpen size={20} />
            <span>My Claims</span>
          </NavLink>
          <NavLink to="/impact" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <BarChart3 size={20} />
            <span>Impact</span>
          </NavLink>
        </>
      )}

      {role === 'VOLUNTEER' && (
        <>
          <NavLink to="/volunteer/tasks" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <Truck size={20} />
            <span>Tasks</span>
          </NavLink>
          <NavLink to="/impact" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <BarChart3 size={20} />
            <span>Impact</span>
          </NavLink>
        </>
      )}

      {role === 'ADMIN' && (
        <>
          <NavLink to="/admin/overview" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <BarChart3 size={20} />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/admin/verifications" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <ShieldAlert size={20} />
            <span>Verify</span>
          </NavLink>
          <NavLink to="/admin/reports" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <ShieldAlert size={20} />
            <span>Reports</span>
          </NavLink>
        </>
      )}

      {/* Notifications tab */}
      <NavLink to="/notifications" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
        <Bell size={20} />
        {unreadNotifCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '25%',
              background: 'var(--danger)',
              color: 'white',
              borderRadius: '50%',
              width: '8px',
              height: '8px'
            }}
          />
        )}
        <span>Alerts</span>
      </NavLink>

      {/* Profile tab */}
      <NavLink to="/profile" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
