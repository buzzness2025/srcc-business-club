import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Phone, Droplet, User, Hash, AlertCircle } from 'lucide-react';

export default function EditMemberModal({ isOpen, onClose, member, onMemberUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    role: 'General Member',
    number: '',
    blood: 'B+',
    joined_date: '',
    months_paid: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        role: member.role || 'General Member',
        number: member.number || '',
        blood: member.blood || 'B+',
        joined_date: member.joined_date || '',
        months_paid: member.months_paid ?? 0
      });
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const roles = [
    'General Member',
    'Executive',
    'Senior Executive',
    'Event Coordinator',
    'Treasurer',
    'General Secretary',
    'Vice President',
    'President',
    'Advisory Member'
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await onMemberUpdated(member.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-400 font-semibold tracking-wider uppercase">Editing Member</div>
            <h3 className="font-bold text-lg">{member.name} ({member.id})</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role in Club
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-medium text-slate-700"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group
              </label>
              <div className="relative">
                <Droplet className="w-4 h-4 text-red-500 absolute left-3 top-3" />
                <select
                  value={formData.blood}
                  onChange={(e) => setFormData({ ...formData, blood: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-medium text-slate-700"
                >
                  {bloodGroups.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Joined Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={formData.joined_date}
                  onChange={(e) => setFormData({ ...formData, joined_date: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Paid Months Adjustment Slider & Dropdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Months Paid to Date:</span>
              <span className="font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                {formData.months_paid} months = {formData.months_paid * 50} ৳ Paid
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="18"
                step="1"
                value={formData.months_paid}
                onChange={(e) => setFormData({ ...formData, months_paid: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <select
                value={formData.months_paid}
                onChange={(e) => setFormData({ ...formData, months_paid: parseInt(e.target.value, 10) })}
                className="text-xs font-semibold border border-slate-300 rounded-lg p-1.5 bg-white"
              >
                {Array.from({ length: 19 }, (_, i) => (
                  <option key={i} value={i}>{i} mo</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
