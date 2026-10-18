// utils.js - Formatters, calculations, and UI helpers

export function formatDateTime(isoString) {
  if (!isoString) return '--';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function formatTimeOnly(isoString) {
  if (!isoString) return '--';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function getTimeRemaining(bestBeforeIso) {
  if (!bestBeforeIso) return { text: 'Unknown', urgency: 'normal', isExpired: false };
  const diffMs = new Date(bestBeforeIso).getTime() - Date.now();

  if (diffMs <= 0) {
    return { text: 'Expired', urgency: 'expired', isExpired: true };
  }

  const diffMins = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;

  let text = '';
  if (hours > 0) {
    text = `${hours}h ${minutes}m left`;
  } else {
    text = `${minutes} min left`;
  }

  // Urgency thresholds per UI_UX_Design_Brief:
  // Amber under 2 hours, Red under 30 minutes
  let urgency = 'normal';
  if (diffMins < 30) {
    urgency = 'danger';
  } else if (diffMins < 120) {
    urgency = 'warning';
  }

  return { text, urgency, isExpired: false, totalMinutes: diffMins };
}

// Haversine formula to compute distance in km
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// Status definitions and presentation
export const STATUS_MAP = {
  ACTIVE: {
    label: 'Available',
    color: '#2E9E5B',
    bgColor: '#E8F8EE',
    desc: 'Available for verified NGOs to claim'
  },
  CLAIMED: {
    label: 'Claimed',
    color: '#2F80ED',
    bgColor: '#EBF3FD',
    desc: 'Claim submitted, awaiting donor confirmation'
  },
  PICKUP_ASSIGNED: {
    label: 'Courier Assigned',
    color: '#0369A1',
    bgColor: '#E0F2FE',
    desc: 'Volunteer assigned for transport'
  },
  IN_TRANSIT: {
    label: 'On The Way',
    color: '#7E22CE',
    bgColor: '#F3E8FF',
    desc: 'Food picked up, en route to NGO destination'
  },
  DELIVERED: {
    label: 'Delivered',
    color: '#065F46',
    bgColor: '#D1FAE5',
    desc: 'Handover complete, arriving at shelter'
  },
  COMPLETED: {
    label: 'Completed',
    color: '#1F7A44',
    bgColor: '#E8F8EE',
    desc: 'Donation cycle completed successfully'
  },
  EXPIRED: {
    label: 'Expired',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    desc: 'Passed best-before window'
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#D64545',
    bgColor: '#FDECEC',
    desc: 'Listing was cancelled by donor'
  }
};

export const CATEGORIES = [
  'All Categories',
  'Cooked Meals',
  'Bakery & Breads',
  'Fresh Produce',
  'Packaged Food',
  'Dairy & Beverages'
];

export const DIET_TYPES = [
  { id: 'ALL', label: 'All Diets' },
  { id: 'VEG', label: 'Vegetarian 🟢', icon: 'veg' },
  { id: 'NON_VEG', label: 'Non-Vegetarian 🔴', icon: 'nonveg' },
  { id: 'VEGAN', label: 'Pure Vegan 🌱', icon: 'vegan' }
];
