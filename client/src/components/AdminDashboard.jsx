import React, { useState, useMemo } from 'react';
import { 
  Search, UserPlus, Filter, Download, Trash2, Edit3, CheckCircle2, 
  AlertCircle, Shield, ArrowUpDown, Clock, Plus, DollarSign, Droplet,
  Archive, RefreshCw, ChevronDown, Lock, Unlock, LogOut, KeyRound, Eye, EyeOff
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboard({
  members,
  stats,
  loading,
  onRefresh,
  onOpenAddMember,
  onOpenEditMember,
  onOpenArchived,
  onDeleteMember,
  onUpdatePayment,
  onBackToPublic
}) {
  // Admin Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAdmin());
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [bloodFilter, setBloodFilter] = useState('ALL');
  const [dueFilter, setDueFilter] = useState('ALL'); // ALL, DUE, CLEARED
  const [updatingId, setUpdatingId] = useState(null);

  // Handle Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setLoginError('Please enter the administrator password.');
      return;
    }

    try {
      setLoginLoading(true);
      setLoginError('');
      await api.adminLogin(adminPassword.trim());
      setIsAuthenticated(true);
      setAdminPassword('');
      if (onRefresh) onRefresh();
    } catch (err) {
      setLoginError(err.message || 'Incorrect password. Access denied.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Admin Logout
  const handleLogout = () => {
    api.clearAdminToken();
    setIsAuthenticated(false);
  };

  // Filtered members based on Role, ID, or Name
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !term || 
        m.name.toLowerCase().includes(term) ||
        m.id.toLowerCase().includes(term) ||
        m.role.toLowerCase().includes(term);

      const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
      const matchesBlood = bloodFilter === 'ALL' || m.blood === bloodFilter;

      let matchesDue = true;
      if (dueFilter === 'DUE') {
        matchesDue = m.due_amount > 0;
      } else if (dueFilter === 'CLEARED') {
        matchesDue = m.due_amount <= 0;
      }

      return matchesSearch && matchesRole && matchesBlood && matchesDue;
    });
  }, [members, searchTerm, roleFilter, bloodFilter, dueFilter]);

  // Unique roles for filter dropdown
  const uniqueRoles = useMemo(() => {
    const roles = new Set(members.map((m) => m.role));
    return Array.from(roles);
  }, [members]);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // Handle Quick +1 Month Payment
  const handleQuickAddMonth = async (member) => {
    if (!isAuthenticated) return;
    if (member.months_paid >= 18) return;
    try {
      setUpdatingId(member.id);
      await onUpdatePayment(member.id, member.months_paid + 1);
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Slider / Dropdown change
  const handleSliderChange = async (memberId, newMonths) => {
    if (!isAuthenticated) return;
    try {
      setUpdatingId(memberId);
      await onUpdatePayment(memberId, parseInt(newMonths, 10));
    } finally {
      setUpdatingId(null);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!members.length) return;
    const headers = [
      'Member ID', 'Name', 'Role', 'Phone', 'Blood Group', 
      'Joined Date', 'Months Elapsed', 'Months Paid', 'Paid (TK)', 'Due (TK)', 'Status'
    ];
    const rows = filteredMembers.map((m) => [
      `"${m.id}"`,
      `"${m.name}"`,
      `"${m.role}"`,
      `"${m.number}"`,
      `"${m.blood}"`,
      `"${m.joined_date}"`,
      m.elapsed_months,
      m.months_paid,
      m.paid_amount,
      m.due_amount,
      m.due_amount > 0 ? 'Due' : 'Cleared'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SRCC_Members_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. If not authenticated, render Admin Login Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 text-white text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Admin Authorization</h2>
            <p className="text-xs text-blue-200 mt-2 leading-relaxed">
              Restricted Area: Only authorized executive panel members can modify monthly payments, edit records, or adjust club dues.
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Administrator Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter admin password..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span><code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-bold"></code></span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4 text-amber-400" />
              <span>{loginLoading ? 'Verifying...' : 'Unlock Admin Controls'}</span>
            </button>

            {onBackToPublic && (
              <button
                type="button"
                onClick={onBackToPublic}
                className="w-full py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors"
              >
                ← Return to Public Website
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  // 2. Authenticated Admin Dashboard View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Admin Status and Logout */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-900/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wide flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Club Administrator
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Session Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Member Directory & Fee Ledger</h1>
          <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl">
            Each person pays <strong>50 TK/month</strong> from join date up to 1.5 years (18 months). 
            System automatically manages tenure and dues calculation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onOpenArchived}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
          >
            <Archive className="w-4 h-4 text-amber-400" />
            <span>1.5-Yr Purged ({stats?.archivedCount ?? 0})</span>
          </button>
          
          <button
            onClick={onOpenAddMember}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>

          <button
            onClick={handleLogout}
            title="Log out from Admin session"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-100 text-xs font-semibold border border-red-500/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Active Members */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Active Members</div>
            <div className="text-2xl font-extrabold text-slate-900">{stats?.totalMembers ?? members.length}</div>
            <div className="text-[11px] text-slate-400">Within 1.5-yr active tenure</div>
          </div>
        </div>

        {/* Total Collected Fees */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Paid Collected</div>
            <div className="text-2xl font-extrabold text-emerald-700">৳ {stats?.totalPaidAmount ?? 0}</div>
            <div className="text-[11px] text-slate-400">Total fees cleared to date</div>
          </div>
        </div>

        {/* Total Dues */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Due (Not Paid)</div>
            <div className="text-2xl font-extrabold text-red-600">৳ {stats?.totalDueAmount ?? 0}</div>
            <div className="text-[11px] text-slate-400">Expected minus Paid to date</div>
          </div>
        </div>

        {/* Monthly Rate & Rule */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Policy Rules</div>
            <div className="text-lg font-extrabold text-slate-900">50 ৳ / Month</div>
            <div className="text-[11px] text-amber-600 font-medium">Auto-deleted after 1.5 yrs</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search and Filters Bar */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Real-time search across Role, ID, or Name */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Role, ID, or Name..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                title="Refresh Table & Sync Calculations"
                className="p-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-xl transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter by:</span>
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium outline-none focus:border-blue-500"
            >
              <option value="ALL">All Roles ({members.length})</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            {/* Blood Group Filter */}
            <select
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium outline-none focus:border-blue-500"
            >
              <option value="ALL">All Blood Groups</option>
              {bloodGroups.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Due Status Filter */}
            <select
              value={dueFilter}
              onChange={(e) => setDueFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium outline-none focus:border-blue-500"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="DUE">Outstanding Due (&gt;0 TK)</option>
              <option value="CLEARED">Fully Cleared (0 TK Due)</option>
            </select>

            {(roleFilter !== 'ALL' || bloodFilter !== 'ALL' || dueFilter !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setRoleFilter('ALL');
                  setBloodFilter('ALL');
                  setDueFilter('ALL');
                  setSearchTerm('');
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold underline ml-auto"
              >
                Reset all filters
              </button>
            )}
          </div>
        </div>

        {/* Member Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4">Member Info</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-3 text-center">Blood</th>
                <th className="py-3.5 px-4">Join Date & Tenure</th>
                <th className="py-3.5 px-4 min-w-[220px]">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Admin Paid Control (Slider / Dropdown)</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">Paid (TK)</th>
                <th className="py-3.5 px-4">Not Paid (Due TK)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No members found matching your criteria.</p>
                    <p className="text-xs mt-1">Try clearing your search term or adjusting filters.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const isUpdating = updatingId === m.id;
                  const isCleared = m.due_amount <= 0;
                  const remainingMonths = Math.max(0, 18 - m.elapsed_months);

                  return (
                    <tr 
                      key={m.id}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        isUpdating ? 'opacity-60 pointer-events-none' : ''
                      }`}
                    >
                      {/* ID, Name, Number */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{m.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {m.id}
                          </span>
                          <span className="text-slate-500 text-[11px]">{m.number}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          m.role.includes('President') 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : m.role.includes('Secretary') || m.role.includes('Treasurer')
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : m.role.includes('Executive')
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {m.role}
                        </span>
                      </td>

                      {/* Blood Group */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[11px]">
                          <Droplet className="w-3 h-3 text-red-500" />
                          {m.blood}
                        </span>
                      </td>

                      {/* Join Date & Duration */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{m.joined_date}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <span className="font-semibold text-slate-700">{m.elapsed_months} mos</span> elapsed 
                          <span className="text-slate-400"> ({remainingMonths} left)</span>
                        </div>
                      </td>

                      {/* Admin-Only Interactive Slider & Dropdown to adjust months paid */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            {/* Dropdown Selector */}
                            <select
                              value={m.months_paid}
                              onChange={(e) => handleSliderChange(m.id, e.target.value)}
                              className="text-xs font-bold border border-slate-300 rounded-lg px-2 py-1 bg-white text-blue-900 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                            >
                              {Array.from({ length: 19 }, (_, i) => (
                                <option key={i} value={i}>
                                  {i} {i === 1 ? 'Month' : 'Months'} ({i * 50} ৳)
                                </option>
                              ))}
                            </select>

                            {/* Quick +1 Month Button */}
                            <button
                              onClick={() => handleQuickAddMonth(m)}
                              disabled={m.months_paid >= 18}
                              title="Add 1 Month (+50 ৳)"
                              className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold border border-blue-200 disabled:opacity-40 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+1 Mo</span>
                            </button>
                          </div>

                          {/* Slider Control */}
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="18"
                              step="1"
                              value={m.months_paid}
                              onChange={(e) => handleSliderChange(m.id, e.target.value)}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="text-[10px] font-mono text-slate-500 w-8 text-right">
                              {m.months_paid}/18
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Paid (TK) */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="text-emerald-700 font-bold text-sm">
                          ৳ {m.paid_amount}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {m.months_paid} mo × 50 TK
                        </div>
                      </td>

                      {/* Not Paid / Due (TK) */}
                      <td className="py-3.5 px-4">
                        {isCleared ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ৳ 0 (Cleared)
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-red-50 text-red-700 border border-red-200">
                              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                              ৳ {m.due_amount} Due
                            </span>
                            <div className="text-[10px] text-red-500 font-medium mt-0.5">
                              {m.elapsed_months * 50 - m.paid_amount} ৳ behind
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenEditMember(m)}
                            title="Edit Member Information"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => onDeleteMember(m.id, m.name)}
                            title="Delete Member"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong>{filteredMembers.length}</strong> of <strong>{members.length}</strong> active members
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Fully Cleared: {members.filter(m => m.due_amount <= 0).length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              With Due: {members.filter(m => m.due_amount > 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
