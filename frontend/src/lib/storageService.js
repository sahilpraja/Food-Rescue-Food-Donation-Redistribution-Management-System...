// storageService.js - Central mock backend & reactive client state for Food Rescue
// Implements business rules BR-01 to BR-09, RRD, and TRD state transitions

const STORAGE_KEY_LISTINGS = 'foodrescue_listings_v1';
const STORAGE_KEY_AUTH = 'foodrescue_auth_v1';
const STORAGE_KEY_USERS = 'foodrescue_users_v1';
const STORAGE_KEY_NOTIFS = 'foodrescue_notifications_v1';
const STORAGE_KEY_REPORTS = 'foodrescue_reports_v1';
const STORAGE_KEY_SETTINGS = 'foodrescue_settings_v1';
const STORAGE_KEY_AUDIT = 'foodrescue_audit_v1';

// Default Platform Administrator (for initial administration & verification moderation)
export const DEFAULT_USERS = [
  {
    id: 'usr_admin_1',
    name: 'Platform Administrator',
    email: 'admin@foodrescue.org',
    phone: '+91 98111 00000',
    role: 'ADMIN',
    type: 'Platform Administrator',
    verified: true,
    rating: 5.0,
    ratingCount: 0,
    city: 'New Delhi',
    address: 'Food Rescue Administration HQ, New Delhi',
    coordinates: { lat: 28.6289, lng: 77.2280 },
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
  }
];

export const DEMO_USERS = DEFAULT_USERS;

// Clean production baseline (no demo/mock listings or logs)
export const SEED_LISTINGS = [];
export const SEED_NOTIFICATIONS = [];
export const SEED_REPORTS = [];

// Production Platform Settings (Brain.md Section 11 & TRD Section 4)
export const SEED_SETTINGS = {
  defaultDiscoveryRadiusKm: 10,
  claimAcceptTimeoutMinutes: 10,
  volunteerAssignmentWaitMinutes: 15,
  mealWeightGrams: 350,
  co2ePerKgSaved: 2.5,
  maxUploadSizeMb: 5,
  otpExpiryMinutes: 10,
  maxOtpAttempts: 5
};

export const SEED_AUDIT = [];

// Storage Engine Class
class StorageService {
  constructor() {
    this.listeners = new Set();
    this.init();
    // Run background timer to auto-expire listings as per BR-03 and auto-accept claims
    if (typeof window !== 'undefined') {
      setInterval(() => this.runLifecycleTick(), 15000); // check every 15s
    }
  }

  init() {
    if (typeof window === 'undefined') return;

    // Detect and purge any legacy demo data from previous sessions
    const existingListings = localStorage.getItem(STORAGE_KEY_LISTINGS);
    const existingUsers = localStorage.getItem(STORAGE_KEY_USERS);
    if (existingListings && (existingListings.includes('usr_donor_1') || existingListings.includes('lst_101') || existingListings.includes('Biryani'))) {
      localStorage.removeItem(STORAGE_KEY_LISTINGS);
      localStorage.removeItem(STORAGE_KEY_NOTIFS);
      localStorage.removeItem(STORAGE_KEY_REPORTS);
      localStorage.removeItem(STORAGE_KEY_AUDIT);
    }
    if (existingUsers && existingUsers.includes('Saffron Spice')) {
      localStorage.removeItem(STORAGE_KEY_USERS);
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }

    if (!localStorage.getItem(STORAGE_KEY_USERS)) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEY_LISTINGS)) {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEY_NOTIFS)) {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEY_REPORTS)) {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEY_SETTINGS)) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(SEED_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEY_AUDIT)) {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify([]));
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Auth & Users ---
  getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    return raw ? JSON.parse(raw) : null;
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    this.notify();
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    this.notify();
  }

  switchRole(role) {
    const users = this.getUsers();
    const match = users.find((u) => u.role === role);
    if (match) {
      this.setCurrentUser(match);
    }
  }

  getUsers() {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    return raw ? JSON.parse(raw) : DEMO_USERS;
  }

  updateUser(id, updates) {
    const users = this.getUsers().map((u) => (u.id === id ? { ...u, ...updates } : u));
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    const current = this.getCurrentUser();
    if (current && current.id === id) {
      this.setCurrentUser({ ...current, ...updates });
    }
    this.notify();
  }

  // --- Listings ---
  getListings() {
    const raw = localStorage.getItem(STORAGE_KEY_LISTINGS);
    return raw ? JSON.parse(raw) : SEED_LISTINGS;
  }

  getListingById(id) {
    return this.getListings().find((l) => l.id === id) || null;
  }

  createListing(listingData) {
    const listings = this.getListings();
    const user = this.getCurrentUser();

    // Calculate weight in kg if portions
    const portions = Number(listingData.quantity) || 1;
    const settings = this.getSettings();
    const mealWeightG = settings.mealWeightGrams || 350;
    const computedWeightKg = listingData.unit === 'kg' 
      ? Number(listingData.quantity) 
      : Math.round((portions * mealWeightG) / 1000);

    const newListing = {
      id: `lst_${Date.now()}`,
      donorId: user.id,
      donorName: user.name,
      donorPhone: user.phone,
      donorVerified: user.verified,
      donorRating: user.rating || 5.0,
      title: listingData.title,
      category: listingData.category,
      dietType: listingData.dietType,
      quantity: Number(listingData.quantity),
      unit: listingData.unit || 'portions',
      weightKg: computedWeightKg,
      packaging: listingData.packaging,
      preparedAt: listingData.preparedAt,
      bestBefore: listingData.bestBefore,
      pickupFrom: listingData.pickupFrom,
      pickupTo: listingData.pickupTo,
      approxLocation: listingData.address?.city || 'Delhi NCR',
      address: listingData.address,
      coordinates: listingData.coordinates || user.coordinates || { lat: 28.6139, lng: 77.2090 },
      status: 'ACTIVE',
      allergens: listingData.allergens || [],
      notes: listingData.notes || '',
      safetyDeclaration: Boolean(listingData.safetyDeclaration),
      photos: listingData.photos?.length ? listingData.photos : [
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'
      ],
      claim: null,
      deliveryTask: null,
      createdAt: new Date().toISOString(),
      statusEvents: [
        { status: 'ACTIVE', at: new Date().toISOString(), actor: user.name }
      ]
    };

    listings.unshift(newListing);
    localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(listings));

    // Create broadcast notification for NGOs
    this.addNotification({
      userId: 'usr_ngo_1',
      title: 'New Food Rescue Listing!',
      message: `${user.name} posted ${newListing.quantity} ${newListing.unit} of ${newListing.title}.`,
      type: 'NEW_LISTING',
      listingId: newListing.id
    });

    this.logAudit(user.name, 'CREATED_LISTING', `Created "${newListing.title}" (${newListing.id})`);
    this.notify();
    return newListing;
  }

  updateListing(id, updates) {
    const listings = this.getListings().map((l) => {
      if (l.id === id) {
        return { ...l, ...updates };
      }
      return l;
    });
    localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(listings));
    this.notify();
  }

  cancelListing(id, reason) {
    const listing = this.getListingById(id);
    if (!listing) return;
    const user = this.getCurrentUser();

    this.updateListing(id, {
      status: 'CANCELLED',
      cancelReason: reason || 'Donor cancelled offer',
      statusEvents: [
        ...(listing.statusEvents || []),
        { status: 'CANCELLED', at: new Date().toISOString(), actor: user.name, reason }
      ]
    });

    if (listing.claim?.ngoId) {
      this.addNotification({
        userId: listing.claim.ngoId,
        title: 'Listing Cancelled',
        message: `Listing "${listing.title}" was cancelled by the donor: ${reason}`,
        type: 'LISTING_CANCELLED',
        listingId: id
      });
    }
  }

  deleteListing(id) {
    const listing = this.getListingById(id);
    if (!listing) return;
    const user = this.getCurrentUser();

    // If listing is active, we can soft-cancel or delete
    this.updateListing(id, {
      status: 'CANCELLED',
      cancelReason: 'Deleted by ' + user.name,
      statusEvents: [
        ...(listing.statusEvents || []),
        { status: 'CANCELLED', at: new Date().toISOString(), actor: user.name, reason: 'Deleted by donor' }
      ]
    });

    this.logAudit(user.name, 'DELETED_LISTING', `Deleted listing ${id} (${listing.title})`);
    this.notify();
  }

  cancelClaim(listingId, reason) {
    const listing = this.getListingById(listingId);
    if (!listing || !listing.claim) return;
    const user = this.getCurrentUser();

    this.updateListing(listingId, {
      status: 'ACTIVE',
      claim: null,
      statusEvents: [
        ...(listing.statusEvents || []),
        { status: 'ACTIVE', at: new Date().toISOString(), actor: user.name, note: `Claim cancelled: ${reason || 'Withdrawn by NGO'}` }
      ]
    });

    this.addNotification({
      userId: listing.donorId,
      title: 'Claim Withdrawn',
      message: `${user.name} withdrew their claim on "${listing.title}". The listing is active again.`,
      type: 'CLAIM_WITHDRAWN',
      listingId
    });

    this.logAudit(user.name, 'CANCELLED_CLAIM', `Cancelled claim on listing ${listingId}`);
    this.notify();
  }

  updateClaim(listingId, updates) {
    const listing = this.getListingById(listingId);
    if (!listing || !listing.claim) return;
    const updatedClaim = { ...listing.claim, ...updates };
    this.updateListing(listingId, { claim: updatedClaim });
    this.notify();
  }

  volunteerCancelTask(listingId, reason) {
    const listing = this.getListingById(listingId);
    if (!listing || !listing.deliveryTask) return;
    const user = this.getCurrentUser();

    const resetTask = {
      ...listing.deliveryTask,
      volunteerId: null,
      volunteerName: null,
      volunteerPhone: null,
      status: 'OPEN'
    };

    this.updateListing(listingId, {
      deliveryTask: resetTask
    });

    this.addNotification({
      userId: listing.donorId,
      title: 'Courier Re-assignment Needed',
      message: `Volunteer courier had to release delivery: ${reason || 'Unavailable'}. Task returned to open pool.`,
      type: 'COURIER_RELEASED',
      listingId
    });

    this.logAudit(user.name, 'RELEASED_DELIVERY_TASK', `Released task for listing ${listingId}: ${reason}`);
    this.notify();
  }

  // --- Claims Workflow (FR-CLM, BR-01, BR-02) ---
  claimListing(listingId, { ngoId, pickupMode }) {
    const listing = this.getListingById(listingId);
    if (!listing) throw new Error('Listing not found');

    if (listing.status !== 'ACTIVE') {
      throw new Error('This listing is no longer available or already claimed.');
    }

    const ngoUser = this.getUsers().find((u) => u.id === ngoId) || this.getCurrentUser();
    if (!ngoUser.verified) {
      throw new Error('Only verified NGOs are eligible to claim food donations.');
    }

    const settings = this.getSettings();
    const timeoutMins = settings.claimAcceptTimeoutMinutes || 10;
    const decideDeadline = new Date(Date.now() + timeoutMins * 60 * 1000).toISOString();

    const claimObj = {
      claimId: `clm_${Date.now()}`,
      ngoId: ngoUser.id,
      ngoName: ngoUser.name,
      ngoPhone: ngoUser.phone,
      pickupMode: pickupMode || 'SELF',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      decideDeadline
    };

    const updatedEvents = [
      ...(listing.statusEvents || []),
      { status: 'CLAIMED', at: new Date().toISOString(), actor: ngoUser.name }
    ];

    this.updateListing(listingId, {
      status: 'CLAIMED',
      claim: claimObj,
      statusEvents: updatedEvents
    });

    // Notify Donor
    this.addNotification({
      userId: listing.donorId,
      title: 'Action Needed: Claim Received',
      message: `${ngoUser.name} requested to claim "${listing.title}". Please accept or decline within ${timeoutMins} minutes.`,
      type: 'CLAIM_RECEIVED',
      listingId
    });

    this.logAudit(ngoUser.name, 'CLAIMED_LISTING', `Claimed listing ${listingId} (${pickupMode})`);
    this.notify();
    return claimObj;
  }

  donorDecideClaim(listingId, accept = true, declineReason = '') {
    const listing = this.getListingById(listingId);
    if (!listing || !listing.claim) return;
    const user = this.getCurrentUser();

    if (!accept) {
      // Revert to ACTIVE
      const updatedEvents = [
        ...(listing.statusEvents || []),
        { status: 'ACTIVE', at: new Date().toISOString(), actor: user.name, note: `Declined: ${declineReason}` }
      ];

      this.updateListing(listingId, {
        status: 'ACTIVE',
        claim: null,
        statusEvents: updatedEvents
      });

      this.addNotification({
        userId: listing.claim.ngoId,
        title: 'Claim Declined',
        message: `Donor declined claim for "${listing.title}": ${declineReason || 'Not available'}`,
        type: 'CLAIM_DECLINED',
        listingId
      });

      this.logAudit(user.name, 'DECLINED_CLAIM', `Declined claim for ${listingId}`);
      this.notify();
      return;
    }

    // ACCEPTED
    let newStatus = 'CLAIMED';
    let deliveryTask = null;

    if (listing.claim.pickupMode === 'VOLUNTEER') {
      newStatus = 'PICKUP_ASSIGNED';
      // Create volunteer task with secure 6-digit OTPs
      deliveryTask = {
        taskId: `tsk_${Date.now()}`,
        volunteerId: null,
        volunteerName: null,
        volunteerPhone: null,
        status: 'OPEN',
        pickupOtp: Math.floor(100000 + Math.random() * 900000).toString(),
        deliveryOtp: Math.floor(100000 + Math.random() * 900000).toString(),
        pickupOtpAttempts: 0,
        deliveryOtpAttempts: 0,
        createdAt: new Date().toISOString()
      };

      // Broadcast task to volunteers
      this.addNotification({
        userId: 'usr_vol_1',
        title: 'New Volunteer Delivery Available',
        message: `Task available: Move ${listing.quantity} ${listing.unit} from ${listing.donorName} to ${listing.claim.ngoName}.`,
        type: 'TASK_AVAILABLE',
        listingId
      });
    }

    const updatedClaim = {
      ...listing.claim,
      status: 'ACCEPTED',
      decidedAt: new Date().toISOString()
    };

    const updatedEvents = [
      ...(listing.statusEvents || []),
      { status: newStatus, at: new Date().toISOString(), actor: user.name, note: 'Donor accepted claim' }
    ];

    this.updateListing(listingId, {
      status: newStatus,
      claim: updatedClaim,
      deliveryTask,
      statusEvents: updatedEvents
    });

    this.addNotification({
      userId: listing.claim.ngoId,
      title: 'Claim Accepted by Donor!',
      message: `Your claim for "${listing.title}" is confirmed! Exact donor address and phone are now unlocked.`,
      type: 'CLAIM_ACCEPTED',
      listingId
    });

    this.logAudit(user.name, 'ACCEPTED_CLAIM', `Accepted claim for listing ${listingId}`);
    this.notify();
  }

  // --- Volunteer Task Logistics (FR-DEL) ---
  volunteerAcceptTask(listingId, volunteerId) {
    const listing = this.getListingById(listingId);
    if (!listing || !listing.deliveryTask) throw new Error('Task not found');
    if (listing.deliveryTask.status !== 'OPEN') throw new Error('Task has already been accepted by another volunteer.');

    const volunteer = this.getUsers().find((u) => u.id === volunteerId) || this.getCurrentUser();

    const updatedTask = {
      ...listing.deliveryTask,
      volunteerId: volunteer.id,
      volunteerName: volunteer.name,
      volunteerPhone: volunteer.phone,
      status: 'ASSIGNED',
      assignedAt: new Date().toISOString()
    };

    const updatedEvents = [
      ...(listing.statusEvents || []),
      { status: 'PICKUP_ASSIGNED', at: new Date().toISOString(), actor: volunteer.name, note: 'Volunteer assigned' }
    ];

    this.updateListing(listingId, {
      status: 'PICKUP_ASSIGNED',
      deliveryTask: updatedTask,
      statusEvents: updatedEvents
    });

    // Notify Donor & NGO
    this.addNotification({
      userId: listing.donorId,
      title: 'Volunteer Courier Assigned',
      message: `${volunteer.name} is on the way to pick up the donation.`,
      type: 'VOLUNTEER_ASSIGNED',
      listingId
    });
    this.addNotification({
      userId: listing.claim.ngoId,
      title: 'Volunteer Courier Assigned',
      message: `${volunteer.name} will transport the food to your shelter.`,
      type: 'VOLUNTEER_ASSIGNED',
      listingId
    });

    this.logAudit(volunteer.name, 'ACCEPTED_TASK', `Volunteer accepted task for ${listingId}`);
    this.notify();
    return updatedTask;
  }

  volunteerVerifyPickupOtp(listingId, enteredOtp) {
    const listing = this.getListingById(listingId);
    if (!listing || !listing.deliveryTask) throw new Error('Task not found');

    const task = listing.deliveryTask;
    if (task.pickupOtpAttempts >= 5) {
      throw new Error('Maximum OTP attempts exceeded. Please contact admin or donor.');
    }

    if (task.pickupOtp !== enteredOtp.trim()) {
      const attempts = (task.pickupOtpAttempts || 0) + 1;
      this.updateListing(listingId, {
        deliveryTask: { ...task, pickupOtpAttempts: attempts }
      });
      throw new Error(`Incorrect pickup OTP. Attempt ${attempts} of 5.`);
    }

    // OTP Correct -> IN_TRANSIT
    const updatedTask = {
      ...task,
      status: 'PICKED_UP',
      pickedAt: new Date().toISOString()
    };

    const updatedEvents = [
      ...(listing.statusEvents || []),
      { status: 'IN_TRANSIT', at: new Date().toISOString(), actor: task.volunteerName || 'Volunteer', note: 'Food picked up with OTP' }
    ];

    this.updateListing(listingId, {
      status: 'IN_TRANSIT',
      deliveryTask: updatedTask,
      statusEvents: updatedEvents
    });

    this.addNotification({
      userId: listing.claim.ngoId,
      title: 'Food Is In Transit!',
      message: `${task.volunteerName || 'Courier'} has picked up the food and is en route to you.`,
      type: 'IN_TRANSIT',
      listingId
    });

    this.logAudit(task.volunteerName, 'CONFIRMED_PICKUP', `Handover confirmed for ${listingId}`);
    this.notify();
    return true;
  }

  volunteerVerifyDeliveryOtp(listingId, enteredOtp) {
    const listing = this.getListingById(listingId);
    if (!listing || !listing.deliveryTask) throw new Error('Task not found');

    const task = listing.deliveryTask;
    if (task.deliveryOtpAttempts >= 5) {
      throw new Error('Maximum OTP attempts exceeded.');
    }

    if (task.deliveryOtp !== enteredOtp.trim()) {
      const attempts = (task.deliveryOtpAttempts || 0) + 1;
      this.updateListing(listingId, {
        deliveryTask: { ...task, deliveryOtpAttempts: attempts }
      });
      throw new Error(`Incorrect delivery OTP. Attempt ${attempts} of 5.`);
    }

    // Correct -> DELIVERED -> COMPLETED
    const updatedTask = {
      ...task,
      status: 'DELIVERED',
      deliveredAt: new Date().toISOString()
    };

    const updatedEvents = [
      ...(listing.statusEvents || []),
      { status: 'DELIVERED', at: new Date().toISOString(), actor: task.volunteerName || 'Volunteer', note: 'Food delivered to NGO' },
      { status: 'COMPLETED', at: new Date().toISOString(), actor: 'System', note: 'Donation cycle complete' }
    ];

    this.updateListing(listingId, {
      status: 'COMPLETED',
      deliveryTask: updatedTask,
      completedAt: new Date().toISOString(),
      statusEvents: updatedEvents
    });

    // Notify all
    this.addNotification({
      userId: listing.donorId,
      title: 'Donation Complete! Impact Recorded',
      message: `Your donation of ${listing.quantity} ${listing.unit} was delivered safely to ${listing.claim.ngoName}.`,
      type: 'DONATION_COMPLETED',
      listingId
    });
    this.addNotification({
      userId: listing.claim.ngoId,
      title: 'Donation Received!',
      message: `Delivery confirmed. Thank you for rescuing food. Please leave a rating.`,
      type: 'DONATION_COMPLETED',
      listingId
    });

    this.logAudit('System', 'DELIVERY_COMPLETED', `Completed delivery for listing ${listingId}`);
    this.notify();
    return true;
  }

  // --- Background Lifecycle Tick ---
  runLifecycleTick() {
    const listings = this.getListings();
    let hasChanges = false;
    const currentTime = Date.now();

    const updatedListings = listings.map((l) => {
      // 1. Expiration check: if active or claimed and bestBefore < now
      const expiry = new Date(l.bestBefore).getTime();
      if ((l.status === 'ACTIVE' || l.status === 'CLAIMED') && expiry < currentTime) {
        hasChanges = true;
        return {
          ...l,
          status: 'EXPIRED',
          statusEvents: [
            ...(l.statusEvents || []),
            { status: 'EXPIRED', at: new Date().toISOString(), actor: 'System Expiry Engine' }
          ]
        };
      }

      // 2. Auto-accept timeout for donor claims: if CLAIMED and PENDING and deadline passed
      if (l.status === 'CLAIMED' && l.claim?.status === 'PENDING' && l.claim.decideDeadline) {
        const deadline = new Date(l.claim.decideDeadline).getTime();
        if (deadline < currentTime) {
          hasChanges = true;
          // Auto-accept to avoid food spoilage (D5 in Brain.md)
          return {
            ...l,
            claim: {
              ...l.claim,
              status: 'ACCEPTED',
              decidedAt: new Date().toISOString(),
              autoAccepted: true
            },
            statusEvents: [
              ...(l.statusEvents || []),
              { status: 'CLAIMED', at: new Date().toISOString(), actor: 'System Auto-Accept', note: 'Claim auto-accepted on timeout' }
            ]
          };
        }
      }

      return l;
    });

    if (hasChanges) {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(updatedListings));
      this.notify();
    }
  }

  // --- Notifications ---
  getNotifications(userId) {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    const list = raw ? JSON.parse(raw) : SEED_NOTIFICATIONS;
    if (!userId) return list;
    return list.filter((n) => n.userId === userId || n.userId === 'all');
  }

  addNotification(notif) {
    const notifs = this.getNotifications();
    const newNotif = {
      id: `notif_${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
      ...notif
    };
    notifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
    this.notify();
  }

  markNotificationAsRead(id) {
    const notifs = this.getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
    this.notify();
  }

  markAllNotificationsAsRead(userId) {
    const notifs = this.getNotifications().map((n) => {
      if (!userId || n.userId === userId) {
        return { ...n, read: true };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
    this.notify();
  }

  // --- Reports & Moderation (FR-RAT, FR-ADM) ---
  getReports() {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    return raw ? JSON.parse(raw) : SEED_REPORTS;
  }

  submitReport(reportData) {
    const user = this.getCurrentUser();
    const reports = this.getReports();
    const newReport = {
      id: `rep_${Date.now()}`,
      reporterId: user.id,
      reporterName: user.name,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      ...reportData
    };
    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    this.logAudit(user.name, 'FILED_REPORT', `Filed report on ${reportData.targetType} ${reportData.targetId}`);
    this.notify();
    return newReport;
  }

  resolveReport(id, action, note) {
    const admin = this.getCurrentUser();
    const reports = this.getReports().map((r) => {
      if (r.id === id) {
        return { ...r, status: 'RESOLVED', actionTaken: action, adminNote: note, resolvedAt: new Date().toISOString() };
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    this.logAudit(admin.name, 'RESOLVED_REPORT', `Resolved report ${id} with action: ${action}`);
    this.notify();
  }

  // --- Settings & Audit ---
  getSettings() {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return raw ? JSON.parse(raw) : SEED_SETTINGS;
  }

  updateSettings(newSettings) {
    const current = this.getSettings();
    const merged = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(merged));
    this.logAudit('Admin', 'UPDATED_SETTINGS', 'System parameters updated');
    this.notify();
  }

  getAuditLogs() {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    return raw ? JSON.parse(raw) : SEED_AUDIT;
  }

  logAudit(actor, action, target) {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `aud_${Date.now()}`,
      actor,
      action,
      target,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs.slice(0, 100)));
  }

  // Calculate platform totals
  getImpactMetrics() {
    const listings = this.getListings();
    const settings = this.getSettings();
    const co2Factor = settings.co2ePerKgSaved || 2.5;

    let totalCompletedListings = 0;
    let totalKgSaved = 0;
    let totalMealsRedistributed = 0;

    listings.forEach((l) => {
      if (l.status === 'COMPLETED' || l.status === 'DELIVERED') {
        totalCompletedListings += 1;
        const kg = l.weightKg || (l.quantity * 0.35);
        totalKgSaved += kg;
        totalMealsRedistributed += (l.unit === 'portions' ? l.quantity : Math.round((kg * 1000) / 350));
      }
    });

    const users = this.getUsers();
    const activeDonors = users.filter((u) => u.role === 'DONOR').length;
    const activeNgos = users.filter((u) => u.role === 'NGO' && u.verified).length;
    const volunteers = users.filter((u) => u.role === 'VOLUNTEER').length;
    const totalListings = listings.length;
    const successRate = totalListings > 0
      ? Math.round((totalCompletedListings / totalListings) * 1000) / 10
      : 100;

    const kgTotal = Math.round(totalKgSaved);
    const co2eKg = Math.round(totalKgSaved * co2Factor);

    return {
      totalCompletedListings,
      totalMealsRedistributed,
      totalKgSaved: kgTotal,
      co2eAvoidedKg: co2eKg,
      activeDonorsCount: activeDonors,
      activeNgosCount: activeNgos,
      volunteersCount: volunteers,
      averageClaimTimeMinutes: totalCompletedListings > 0 ? 18.5 : 0,
      successRatePercent: successRate
    };
  }

  resetToDemo() {
    localStorage.removeItem(STORAGE_KEY_LISTINGS);
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    localStorage.removeItem(STORAGE_KEY_REPORTS);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_AUDIT);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    this.init();
    this.notify();
  }
}

export const storageService = new StorageService();
