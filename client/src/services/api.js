const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY = 'srcc_business_club_admin_token';

export const api = {
  // Admin Token Management
  getAdminToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  },

  setAdminToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearAdminToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAdmin() {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Admin Login
  async adminLogin(password) {
    const res = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Authentication failed');
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    return data;
  },

  // Public Member Application
  async applyMembership(applicationData) {
    const res = await fetch(`${BASE_URL}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Application failed');
    return data;
  },

  // Public / Member List
  async getMembers(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.role) searchParams.append('role', params.role);
    if (params.blood) searchParams.append('blood', params.blood);
    if (params.status) searchParams.append('status', params.status);

    const query = searchParams.toString();
    const res = await fetch(`${BASE_URL}/members${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch members');
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${BASE_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch statistics');
    return res.json();
  },

  // Admin Only Operations
  async createMember(memberData) {
    const token = this.getAdminToken();
    const res = await fetch(`${BASE_URL}/members`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-key': token 
      },
      body: JSON.stringify(memberData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create member');
    return data;
  },

  async updateMember(id, memberData) {
    const token = this.getAdminToken();
    const res = await fetch(`${BASE_URL}/members/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-key': token 
      },
      body: JSON.stringify(memberData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update member');
    return data;
  },

  async updatePaidMonths(id, months_paid) {
    const token = this.getAdminToken();
    const res = await fetch(`${BASE_URL}/members/${encodeURIComponent(id)}/payment`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-key': token 
      },
      body: JSON.stringify({ months_paid })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update payment');
    return data;
  },

  async deleteMember(id) {
    const token = this.getAdminToken();
    const res = await fetch(`${BASE_URL}/members/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 
        'x-admin-key': token 
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete member');
    return data;
  },

  async lookupMember(query) {
    const res = await fetch(`${BASE_URL}/members/lookup?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Member not found');
    return data;
  },

  async getArchivedMembers() {
    const res = await fetch(`${BASE_URL}/archived`);
    if (!res.ok) throw new Error('Failed to fetch archived members');
    return res.json();
  },

  async restoreMember(id) {
    const token = this.getAdminToken();
    const res = await fetch(`${BASE_URL}/archived/${encodeURIComponent(id)}/restore`, {
      method: 'POST',
      headers: { 
        'x-admin-key': token 
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to restore member');
    return data;
  }
};
