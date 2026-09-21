import React, { useState } from 'react';
import { X, UserCheck, Phone, Droplet, User, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function PublicApplyModal({ isOpen, onClose, onApplied }) {
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    blood: 'B+',
    role: 'General Member'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  if (!isOpen) return null;

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.number.trim()) {
      setError('Please fill in your full name and phone number.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.applyMembership(formData);
      setSuccessResult(res);
      if (onApplied) onApplied();
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSuccessResult(null);
    setError('');
    setFormData({ name: '', number: '', blood: 'B+', role: 'General Member' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Apply for Membership</h3>
              <p className="text-xs text-slate-400">SRCC Business Club Application Form</p>
            </div>
          </div>
          <button 
            onClick={handleCloseModal}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation Card */}
        {successResult ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-slate-900">Application Received!</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              {successResult.message}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
              Your member account starts today with <strong>50 TK/month</strong> fee standard. 
              Only club administrators can log your monthly payments.
            </div>
            <button
              onClick={handleCloseModal}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="017xxxxxxxx"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
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

            {/* Note on Monthly Contribution */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">Membership Fee Policy:</div>
              <div>• Monthly contribution: <strong>50 TK</strong> per month.</div>
              <div>• Active tenure: <strong>1.5 years (18 months)</strong>.</div>
              <div className="text-[11px] text-amber-700 pt-1 font-medium">
                Note: Payment logs can only be recorded by Club Administration upon fee submission.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
