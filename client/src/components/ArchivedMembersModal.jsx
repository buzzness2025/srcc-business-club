import React from 'react';
import { X, Archive, Clock, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';

export default function ArchivedMembersModal({ isOpen, onClose, archivedMembers, onRestore }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">1.5-Year Auto-Deleted Members</h3>
              <p className="text-xs text-slate-400">Members automatically retired upon completing 1.5 years (18 months)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-start gap-3 text-xs text-amber-800">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Automated Club Policy:</strong> Per club regulations, active membership terminates after 1.5 years (18 months from join date). The system safely archives their records to preserve historical club data.
          </div>
        </div>

        {/* List Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {archivedMembers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-500" />
              <p className="text-sm font-semibold">No members have reached the 1.5-year limit yet.</p>
              <p className="text-xs mt-1">Members joined over 18 months ago will automatically appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {archivedMembers.map((m) => (
                <div 
                  key={m.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{m.name}</span>
                      <span className="font-mono text-xs px-2 py-0.5 bg-slate-200 rounded text-slate-700">
                        {m.id}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {m.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-4">
                      <span>Joined: <strong>{m.joined_date}</strong></span>
                      <span>Auto-Archived: <strong>{m.archived_at ? new Date(m.archived_at).toLocaleDateString() : 'Expired'}</strong></span>
                      <span>Total Paid: <strong>{m.months_paid * 50} ৳</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRestore(m.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
