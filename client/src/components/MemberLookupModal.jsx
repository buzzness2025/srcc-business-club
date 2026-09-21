import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertTriangle, Shield, User, Phone, Calendar, Droplet, CreditCard } from 'lucide-react';
import { api } from '../services/api';

export default function MemberLookupModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setMember(null);

    try {
      const data = await api.lookupMember(query.trim());
      setMember(data);
    } catch (err) {
      setError(err.message || 'No active member found matching this ID or Phone.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Check Membership & Dues</h3>
              <p className="text-xs text-slate-400">SRCC Business Club Public Verification</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Student ID (e.g. SRCC-001) or Phone..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Lookup'}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-sm text-amber-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Member Card Result */}
          {member && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-200/70 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-lg">{member.name}</h4>
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {member.role}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">ID</span>
                  <span className="font-mono font-bold text-sm text-slate-800">{member.id}</span>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-200 py-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{member.number}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Droplet className="w-4 h-4 text-red-500" />
                  <span>Blood: <strong className="text-slate-800">{member.blood}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Joined: <strong className="text-slate-800">{member.joined_date}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Duration: <strong className="text-slate-800">{member.elapsed_months} / 18 mos</strong></span>
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Monthly Contribution Rate:</span>
                  <span className="font-semibold text-slate-800">50 TK / month</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Months Paid to Date:</span>
                  <span className="font-bold text-blue-700">{member.months_paid} months (৳ {member.paid_amount})</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Expected to Date:</span>
                  <span className="font-semibold text-slate-800">৳ {member.expected_amount}</span>
                </div>
                
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Due Amount:</span>
                  {member.due_amount > 0 ? (
                    <span className="text-sm font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                      ৳ {member.due_amount} Due
                    </span>
                  ) : (
                    <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      All Cleared (৳0)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
