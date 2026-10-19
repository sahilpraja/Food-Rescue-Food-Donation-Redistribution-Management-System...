// apiClient.js - REST API connector for Spring Boot Backend (/api/v1)
// With automatic graceful fallback to storageService when offline or in standalone demo mode

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('foodrescue_jwt_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('foodrescue_jwt_token', token);
    } else {
      localStorage.removeItem('foodrescue_jwt_token');
    }
  }

  getToken() {
    return this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${BACKEND_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.detail || errorData.message || (errorData.fieldErrors ? Object.values(errorData.fieldErrors).join(', ') : `Request failed with status ${response.status}`);
        throw new Error(msg);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[ApiClient] Backend call to ${endpoint} failed (${err.message}).`);
      throw err;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res && res.accessToken) {
      this.setToken(res.accessToken);
    }
    return res;
  }

  async register(data) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res && res.accessToken) {
      this.setToken(res.accessToken);
    }
    return res;
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(email, otp, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword })
    });
  }

  // Listings endpoints
  async getAllListings(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/listings${query ? `?${query}` : ''}`);
  }

  async getNearbyListings(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/listings/nearby?${query}`);
  }

  async getMyListings() {
    return this.request('/listings/mine');
  }

  async createListing(data) {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateListing(id, data) {
    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteListing(id) {
    return this.request(`/listings/${id}`, {
      method: 'DELETE'
    });
  }

  async getListingById(id) {
    return this.request(`/listings/${id}`);
  }

  async cancelListing(id, reason) {
    return this.request(`/listings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // Claims endpoints
  async claimListing(listingId, pickupMode) {
    return this.request(`/listings/${listingId}/claims`, {
      method: 'POST',
      body: JSON.stringify({ pickupMode })
    });
  }

  async getMyClaims() {
    return this.request('/claims/mine');
  }

  async getClaimById(id) {
    return this.request(`/claims/${id}`);
  }

  async getClaimForListing(listingId) {
    return this.request(`/claims/listing/${listingId}`);
  }

  async updateClaim(id, data) {
    return this.request(`/claims/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async cancelClaim(id, reason) {
    return this.request(`/claims/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async decideClaim(claimId, accept, reason) {
    const endpoint = accept ? `/claims/${claimId}/accept` : `/claims/${claimId}/decline`;
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // Volunteer Task endpoints
  async getNearbyTasks() {
    return this.request('/tasks/nearby');
  }

  async getMyTasks() {
    return this.request('/tasks/mine');
  }

  async getAllTasks(status) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/tasks${query}`);
  }

  async getTaskById(id) {
    return this.request(`/tasks/${id}`);
  }

  async acceptTask(taskId) {
    return this.request(`/tasks/${taskId}/accept`, { method: 'POST' });
  }

  async cancelTask(taskId, reason) {
    return this.request(`/tasks/${taskId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async verifyPickupOtp(taskId, otp) {
    return this.request(`/tasks/${taskId}/pickup`, {
      method: 'POST',
      body: JSON.stringify({ otp })
    });
  }

  async verifyDeliveryOtp(taskId, otp) {
    return this.request(`/tasks/${taskId}/deliver`, {
      method: 'POST',
      body: JSON.stringify({ otp })
    });
  }

  // Users endpoints
  async getCurrentUserProfile() {
    return this.request('/users/me');
  }

  async updateProfile(data) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  // Admin endpoints
  async getAdminVerifications() {
    return this.request('/admin/verifications');
  }

  async approveVerification(id) {
    return this.request(`/admin/verifications/${id}/approve`, { method: 'POST' });
  }

  async rejectVerification(id, reason) {
    return this.request(`/admin/verifications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async getAdminReports(status = 'PENDING') {
    return this.request(`/admin/reports?status=${status}`);
  }

  async resolveReport(id, action, note) {
    return this.request(`/admin/reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action, note })
    });
  }

  async getAdminAuditLogs() {
    return this.request('/admin/audit');
  }

  async getAdminListings(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/listings${query ? `?${query}` : ''}`);
  }

  async deleteAdminListing(id, reason) {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return this.request(`/admin/listings/${id}${query}`, {
      method: 'DELETE'
    });
  }

  async getAdminUsers(role) {
    const query = role ? `?role=${role}` : '';
    return this.request(`/admin/users${query}`);
  }

  async updateAdminUserStatus(id, data) {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async registerAdmin(data) {
    return this.request('/admin/register-admin', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'POST' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'POST' });
  }

  // Impact endpoints
  async getPlatformImpact() {
    return this.request('/impact/platform');
  }

  async getMyImpact() {
    return this.request('/impact/me');
  }
}

export const apiClient = new ApiClient();
