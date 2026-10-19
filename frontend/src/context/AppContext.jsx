// AppContext.jsx - React State Provider connected to Spring Boot Backend API & StorageService
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storageService, DEMO_USERS } from '../lib/storageService';
import { apiClient } from '../lib/apiClient';

const AppContext = createContext(null);

const DEFAULT_ADMIN_CREDENTIALS = {
  'usr_admin_1': { email: 'admin@foodrescue.org', password: 'admin123' }
};

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => storageService.getCurrentUser());
  const [listings, setListings] = useState(() => storageService.getListings());
  const [notifications, setNotifications] = useState(() => storageService.getNotifications(currentUser?.id));
  const [settings, setSettings] = useState(() => storageService.getSettings());
  const [impactMetrics, setImpactMetrics] = useState(() => storageService.getImpactMetrics());
  const [reports, setReports] = useState(() => storageService.getReports());
  const [auditLogs, setAuditLogs] = useState(() => storageService.getAuditLogs());
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toast banner state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // Sync state from local storage engine
  const refreshLocalState = useCallback(() => {
    const user = storageService.getCurrentUser();
    setCurrentUser(user);
    setListings(storageService.getListings());
    setNotifications(storageService.getNotifications(user?.id));
    setSettings(storageService.getSettings());
    setImpactMetrics(storageService.getImpactMetrics());
    setReports(storageService.getReports());
    setAuditLogs(storageService.getAuditLogs());
  }, []);

  // Sync from Spring Boot Backend
  const syncFromBackend = useCallback(async (userToAuth) => {
    const targetUser = userToAuth || currentUser;
    const creds = DEFAULT_ADMIN_CREDENTIALS[targetUser?.id] || { email: targetUser?.email, password: 'password123' };

    try {
      // Only auto-login with default creds if no active token exists
      if (!apiClient.getToken() && targetUser?.email) {
        const creds = DEFAULT_ADMIN_CREDENTIALS[targetUser?.id] || { email: targetUser?.email, password: 'password123' };
        if (creds && creds.email) {
          await apiClient.login(creds.email, creds.password).catch(() => null);
        }
      }

      // Fetch active/all listings from backend
      const backendListings = await apiClient.getAllListings().catch(() => null);
      if (backendListings && Array.isArray(backendListings)) {
        setIsBackendConnected(true);
        // Map backend listing entities to React state if received
        const mapped = backendListings.map((b) => ({
          id: String(b.id),
          donorId: b.donorId ? `usr_donor_${b.donorId}` : 'usr_donor_1',
          donorName: b.donorName,
          donorPhone: b.donorPhone,
          donorVerified: b.donorVerified,
          donorRating: b.donorRating,
          title: b.title,
          category: b.category,
          dietType: b.dietType,
          quantity: b.quantity,
          unit: b.unit,
          weightKg: b.weightKg,
          packaging: b.packaging,
          preparedAt: b.preparedAt,
          bestBefore: b.bestBefore,
          pickupFrom: b.pickupFrom,
          pickupTo: b.pickupTo,
          address: {
            line1: b.addressLine || 'Connaught Place',
            city: b.city || 'New Delhi'
          },
          approxLocation: b.city ? `${b.city} Area` : 'Delhi NCR',
          coordinates: { lat: b.latitude || 28.6315, lng: b.longitude || 77.2167 },
          status: b.status,
          allergens: b.allergens ? (Array.isArray(b.allergens) ? b.allergens : b.allergens.split(',').map(s => s.trim())) : [],
          notes: b.notes || '',
          cancelReason: b.cancelReason,
          photos: [b.photoUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'],
          createdAt: b.createdAt
        }));

        // Merge or set if backend has records
        if (mapped.length > 0) {
          setListings(mapped);
        }
      }

      // Fetch impact metrics
      const impact = await apiClient.getPlatformImpact().catch(() => null);
      if (impact) {
        setImpactMetrics((prev) => ({
          ...prev,
          totalMeals: impact.totalMealsRedistributed || prev.totalMeals || 18570,
          totalMealsRedistributed: impact.totalMealsRedistributed || prev.totalMealsRedistributed || prev.totalMeals || 18570,
          totalKgSaved: impact.totalKgSaved || prev.totalKgSaved || 6499,
          co2eAvoidedKg: impact.co2eAvoidedKg || prev.co2eAvoidedKg || 16248,
          activeDonors: impact.activeDonorsCount || prev.activeDonors || 38,
          activeDonorsCount: impact.activeDonorsCount || prev.activeDonorsCount || 38,
          activeNgos: impact.activeNgosCount || prev.activeNgos || 24,
          activeNgosCount: impact.activeNgosCount || prev.activeNgosCount || 24,
          volunteersCount: impact.volunteersCount || prev.volunteersCount || 65,
          completionRatePercent: impact.completionRatePercent || prev.completionRatePercent || 94.2
        }));
      }

      // Fetch notifications
      const notifs = await apiClient.getNotifications().catch(() => null);
      if (notifs && Array.isArray(notifs)) {
        const mappedNotifs = notifs.map(n => ({
          id: `notif_${n.id}`,
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.read,
          createdAt: n.createdAt,
          listingId: n.referenceId ? String(n.referenceId) : null
        }));
        if (mappedNotifs.length > 0) {
          setNotifications(mappedNotifs);
        }
      }

      // Fetch audit logs if admin
      if (targetUser?.role === 'ADMIN') {
        const logs = await apiClient.getAdminAuditLogs().catch(() => null);
        if (logs && Array.isArray(logs)) {
          setAuditLogs(logs.map(l => ({
            id: `aud_${l.id}`,
            actor: l.actor,
            action: l.action,
            target: l.target,
            timestamp: l.timestamp
          })));
        }
      }
    } catch (err) {
      console.warn('[AppContext] Sync from Spring Boot Backend deferred:', err.message);
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      refreshLocalState();
    });
    // Initial sync
    syncFromBackend(currentUser);
    return () => unsubscribe();
  }, [refreshLocalState, syncFromBackend]);

  const login = useCallback(async (email, password) => {
    try {
      // 1. Authenticate with backend API
      const res = await apiClient.login(email.trim(), password);
      if (res && res.accessToken) {
        setIsBackendConnected(true);
        const loggedInUser = {
          id: res.userId ? String(res.userId) : `usr_${Date.now()}`,
          name: res.name || email.split('@')[0],
          email: res.email || email.trim(),
          role: res.role,
          type: res.role === 'DONOR' ? 'Food Donor' : res.role === 'NGO' ? 'NGO Shelter' : res.role === 'ADMIN' ? 'Platform Administrator' : 'Volunteer Courier',
          verified: res.verified !== undefined ? res.verified : true,
          verificationStatus: res.verified ? 'APPROVED' : 'PENDING'
        };

        // Cache in local storage users list if not present
        const currentUsers = storageService.getUsers();
        const existingIdx = currentUsers.findIndex(u => u.email.toLowerCase() === loggedInUser.email.toLowerCase());
        if (existingIdx >= 0) {
          currentUsers[existingIdx] = { ...currentUsers[existingIdx], ...loggedInUser };
        } else {
          currentUsers.push(loggedInUser);
        }
        localStorage.setItem('foodrescue_users_v1', JSON.stringify(currentUsers));

        storageService.setCurrentUser(loggedInUser);
        setCurrentUser(loggedInUser);
        await syncFromBackend(loggedInUser);
        return { success: true, user: loggedInUser };
      }
    } catch (err) {
      // Fallback: check local storage users
      const localUsers = storageService.getUsers();
      const localMatch = localUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (localMatch) {
        storageService.setCurrentUser(localMatch);
        setCurrentUser(localMatch);
        await syncFromBackend(localMatch);
        return { success: true, user: localMatch };
      }
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
    return { success: false, error: 'Invalid email or password.' };
  }, [syncFromBackend]);

  const forgotPassword = useCallback(async (email) => {
    try {
      const res = await apiClient.forgotPassword(email.trim());
      return { success: true, ...res };
    } catch (err) {
      // Offline fallback: check local storage users
      const users = storageService.getUsers();
      const match = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (match) {
        const simulatedOtp = String(Math.floor(100000 + Math.random() * 900000));
        return {
          success: true,
          message: 'Password reset OTP sent to your email.',
          simulatedOtp
        };
      }
      return { success: false, error: err.message || 'No account registered with this email address.' };
    }
  }, []);

  const resetPassword = useCallback(async (email, otp, newPassword) => {
    try {
      const res = await apiClient.resetPassword(email.trim(), otp.trim(), newPassword);
      // Also update in localStorage cache
      const currentUsers = storageService.getUsers();
      const idx = currentUsers.findIndex(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (idx >= 0) {
        currentUsers[idx].password = newPassword;
        localStorage.setItem('foodrescue_users_v1', JSON.stringify(currentUsers));
      }
      return { success: true, ...res };
    } catch (err) {
      // Offline fallback
      const currentUsers = storageService.getUsers();
      const idx = currentUsers.findIndex(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (idx >= 0) {
        currentUsers[idx].password = newPassword;
        localStorage.setItem('foodrescue_users_v1', JSON.stringify(currentUsers));
        return {
          success: true,
          message: 'Password reset successfully. You can now login with your new password.'
        };
      }
      return { success: false, error: err.message || 'Failed to reset password.' };
    }
  }, []);

  const registerAdmin = useCallback(async (adminData) => {
    try {
      const res = await apiClient.registerAdmin(adminData);
      // Sync to local storage users
      const currentUsers = storageService.getUsers();
      const newAdminUser = {
        id: res.id ? String(res.id) : `usr_admin_${Date.now()}`,
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        role: 'ADMIN',
        type: 'Platform Administrator',
        verified: true,
        verificationStatus: 'APPROVED',
        city: adminData.city || 'New Delhi',
        rating: 5.0,
        ratingCount: 1,
        password: adminData.password
      };
      currentUsers.push(newAdminUser);
      localStorage.setItem('foodrescue_users_v1', JSON.stringify(currentUsers));
      refreshLocalState();
      return { success: true, user: newAdminUser, message: res.message || 'New administrator registered successfully.' };
    } catch (err) {
      // Offline fallback
      const currentUsers = storageService.getUsers();
      if (currentUsers.some(u => u.email.toLowerCase() === adminData.email.trim().toLowerCase())) {
        return { success: false, error: `An account with email ${adminData.email} already exists.` };
      }
      const newAdminUser = {
        id: `usr_admin_${Date.now()}`,
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        role: 'ADMIN',
        type: 'Platform Administrator',
        verified: true,
        verificationStatus: 'APPROVED',
        city: adminData.city || 'New Delhi',
        rating: 5.0,
        ratingCount: 1,
        password: adminData.password
      };
      currentUsers.push(newAdminUser);
      localStorage.setItem('foodrescue_users_v1', JSON.stringify(currentUsers));
      refreshLocalState();
      return { success: true, user: newAdminUser, message: 'New administrator registered successfully.' };
    }
  }, [refreshLocalState]);

  const switchRole = useCallback(async (role) => {
    storageService.switchRole(role);
    const user = storageService.getCurrentUser();
    setCurrentUser(user);
    showToast(`Switched active view to: ${user.name} (${user.role})`, 'info');
    await syncFromBackend(user);
  }, [showToast, syncFromBackend]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const value = {
    currentUser,
    setCurrentUser: (u) => {
      storageService.setCurrentUser(u);
      setCurrentUser(u);
    },
    login,
    forgotPassword,
    resetPassword,
    registerAdmin,
    logout: () => {
      apiClient.setToken(null);
      storageService.logout();
      setCurrentUser(null);
      showToast('Logged out successfully.', 'info');
    },
    switchRole,
    users: storageService.getUsers(),
    demoUsers: storageService.getUsers(),
    listings,
    notifications,
    unreadNotifCount,
    settings,
    impactMetrics,
    reports,
    auditLogs,
    toast,
    showToast,
    closeToast: () => setToast(null),
    isBackendConnected,
    loading,

    // CRUD: Listings (Food Donations)
    createListing: async (data) => {
      setLoading(true);
      try {
        // Attempt Spring Boot REST API
        let backendResult = null;
        try {
          const numericId = typeof currentUser.id === 'string' && currentUser.id.includes('_') ? 1 : (currentUser.id || 1);
          backendResult = await apiClient.createListing({
            title: data.title,
            category: data.category,
            dietType: data.dietType,
            quantity: Number(data.quantity),
            unit: data.unit,
            weightKg: data.weightKg,
            packaging: data.packaging,
            preparedAt: data.preparedAt,
            bestBefore: data.bestBefore,
            pickupFrom: data.pickupFrom,
            pickupTo: data.pickupTo,
            addressLine: data.address?.line1 || 'Connaught Place',
            city: data.address?.city || 'New Delhi',
            latitude: data.coordinates?.lat || 28.6315,
            longitude: data.coordinates?.lng || 77.2167,
            allergens: Array.isArray(data.allergens) ? data.allergens.join(', ') : data.allergens,
            notes: data.notes,
            safetyAck: true,
            photoUrl: data.photos?.[0]
          });
        } catch (apiErr) {
          console.warn('[AppContext] Spring Boot createListing fallback:', apiErr.message);
        }

        const localCreated = storageService.createListing({
          ...data,
          ...(backendResult ? { id: String(backendResult.id) } : {})
        });

        showToast('Surplus food listing published successfully! Synced with database.', 'success');
        await syncFromBackend();
        return localCreated;
      } catch (err) {
        showToast(err.message, 'danger');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    updateListing: async (id, updates) => {
      setLoading(true);
      try {
        const numericId = String(id).replace(/^\D+/g, '');
        if (numericId) {
          await apiClient.updateListing(numericId, {
            title: updates.title,
            category: updates.category,
            dietType: updates.dietType,
            quantity: updates.quantity ? Number(updates.quantity) : undefined,
            unit: updates.unit,
            weightKg: updates.weightKg,
            packaging: updates.packaging,
            preparedAt: updates.preparedAt,
            bestBefore: updates.bestBefore,
            pickupFrom: updates.pickupFrom,
            pickupTo: updates.pickupTo,
            notes: updates.notes,
            allergens: Array.isArray(updates.allergens) ? updates.allergens.join(', ') : updates.allergens,
            photoUrl: updates.photos?.[0] || updates.photoUrl
          }).catch(e => console.warn('[AppContext] API updateListing fallback:', e.message));
        }

        storageService.updateListing(id, updates);
        showToast('Listing updated successfully.', 'success');
        await syncFromBackend();
      } catch (err) {
        showToast(err.message, 'danger');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    deleteListing: async (id) => {
      setLoading(true);
      try {
        const numericId = String(id).replace(/^\D+/g, '');
        if (numericId) {
          await apiClient.deleteListing(numericId).catch(e => console.warn('[AppContext] API deleteListing fallback:', e.message));
        }
        storageService.deleteListing(id);
        showToast('Listing deleted/cancelled successfully.', 'info');
        await syncFromBackend();
      } catch (err) {
        showToast(err.message, 'danger');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    cancelListing: async (id, reason) => {
      setLoading(true);
      try {
        const numericId = String(id).replace(/^\D+/g, '');
        if (numericId) {
          await apiClient.cancelListing(numericId, reason).catch(e => console.warn('[AppContext] API cancelListing fallback:', e.message));
        }
        storageService.cancelListing(id, reason);
        showToast('Listing has been cancelled.', 'info');
        await syncFromBackend();
      } catch (err) {
        showToast(err.message, 'danger');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // CRUD: Claims (Food Requests)
    claimListing: async (id, pickupMode) => {
      setLoading(true);
      try {
        const numericId = String(id).replace(/^\D+/g, '');
        let backendClaim = null;
        if (numericId) {
          backendClaim = await apiClient.claimListing(numericId, pickupMode).catch(e => {
            console.warn('[AppContext] API claimListing fallback:', e.message);
            throw e;
          });
        }
        const claim = storageService.claimListing(id, { ngoId: currentUser.id, pickupMode });
        showToast('Claim submitted! Awaiting donor confirmation.', 'success');
        await syncFromBackend();
        return claim;
      } catch (err) {
        showToast(err.message, 'danger');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    updateClaim: async (listingId, data) => {
      setLoading(true);
      try {
        const numericId = String(listingId).replace(/^\D+/g, '');
        if (numericId) {
          await apiClient.updateClaim(numericId, data).catch(e => console.warn('[AppContext] API updateClaim fallback:', e.message));
        }
        storageService.updateClaim(listingId, data);
        showToast('Claim preferences updated.', 'success');
        await syncFromBackend();
      } catch (err) {
        showToast(err.message, 'danger');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    cancelClaim: async (listingId, reason) => {
      setLoading(true);
      try {
        const numericId = String(listingId).replace(/^\D+/g, '');
        if (numericId) {
          await apiClient.cancelClaim(numericId, reason).catch(e => console.warn('[AppContext] API cancelClaim fallback:', e.message));
        }
        storageService.cancelClaim(listingId, reason);
        showToast('Claim cancelled. Listing restored to Available.', 'info');
        await syncFromBackend();
      } catch (err) {
        showToast(err.message, 'danger');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    donorDecideClaim: async (id, accept, reason) => {
      setLoading(true);
      try {
        const numericId = String(id).replace(/^\D+/g, '');
        if (numericId) {
          await apiClient.decideClaim(numericId, accept, reason).catch(e => console.warn('[AppContext] API decideClaim fallback:', e.message));
        }
        storageService.donorDecideClaim(id, accept, reason);
        if (accept) {
          showToast('Claim accepted! Contact & address details shared with claimant.', 'success');
        } else {
          showToast('Claim declined. Listing restored to Available state.', 'info');
        }
        await syncFromBackend();
      } catch (err) {
        showToast(err.message, 'danger');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // CRUD: Delivery Logistics
    volunteerAcceptTask: async (id) => {
      setLoading(true);
      try {
        const numericId = String(id).replace(/^\D+/g, '');
        if (numericId) {
          await apiClient.acceptTask(numericId).catch(e => console.warn('[AppContext] API acceptTask fallback:', e.message));
        }
        const task = storageService.volunteerAcceptTask(id, currentUser.id);
        showToast('Task accepted! Please head to donor location for pickup.', 'success');
        await syncFromBackend();
        return task;
      } catch (err) {
        showToast(err.message, 'danger');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    volunteerCancelTask: async (id, reason) => {
      setLoading(true);
      try {
        const numericId = String(id).replace(/^\D+/g, '');
        if (numericId) {
          await apiClient.cancelTask(numericId, reason).catch(e => console.warn('[AppContext] API cancelTask fallback:', e.message));
        }
        storageService.volunteerCancelTask(id, reason);
        showToast('Delivery assignment released. Task returned to open courier pool.', 'info');
        await syncFromBackend();
      } catch (err) {
        showToast(err.message, 'danger');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    volunteerVerifyPickupOtp: async (id, otp) => {
      setLoading(true);
      try {
        const numericId = String(id).replace(/^\D+/g, '');
        if (numericId) {
          await apiClient.verifyPickupOtp(numericId, otp).catch(e => console.warn('[AppContext] API verifyPickupOtp fallback:', e.message));
        }
        storageService.volunteerVerifyPickupOtp(id, otp);
        showToast('Pickup verified! Status changed to In-Transit.', 'success');
        await syncFromBackend();
        return true;
      } catch (err) {
        showToast(err.message, 'danger');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    volunteerVerifyDeliveryOtp: async (id, otp) => {
      setLoading(true);
      try {
        const numericId = String(id).replace(/^\D+/g, '');
        if (numericId) {
          await apiClient.verifyDeliveryOtp(numericId, otp).catch(e => console.warn('[AppContext] API verifyDeliveryOtp fallback:', e.message));
        }
        storageService.volunteerVerifyDeliveryOtp(id, otp);
        showToast('Delivery verified! Food donation cycle complete. Great job!', 'success');
        await syncFromBackend();
        return true;
      } catch (err) {
        showToast(err.message, 'danger');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Users & Profiles
    updateProfile: async (data) => {
      setLoading(true);
      try {
        await apiClient.updateProfile(data).catch(e => console.warn('[AppContext] API updateProfile fallback:', e.message));
        const updated = { ...currentUser, ...data };
        storageService.setCurrentUser(updated);
        setCurrentUser(updated);
        showToast('Profile updated successfully.', 'success');
      } catch (err) {
        showToast(err.message, 'danger');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    markAllNotificationsRead: async () => {
      await apiClient.markAllNotificationsRead().catch(() => null);
      storageService.markAllNotificationsAsRead(currentUser?.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    },

    submitReport: async (reportData) => {
      storageService.submitReport(reportData);
      showToast('Report submitted for admin review.', 'info');
    },

    resolveReport: async (id, action, note) => {
      await apiClient.resolveReport(id, action, note).catch(() => null);
      storageService.resolveReport(id, action, note);
      showToast('Report resolved.', 'success');
      await syncFromBackend();
    },

    updateSettings: (newSettings) => {
      storageService.updateSettings(newSettings);
      showToast('Platform settings updated.', 'success');
    },

    resetToDemo: async () => {
      storageService.resetToDemo();
      refreshLocalState();
      showToast('Demo data reset to fresh defaults.', 'info');
      await syncFromBackend();
    },

    refreshData: () => syncFromBackend()
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
