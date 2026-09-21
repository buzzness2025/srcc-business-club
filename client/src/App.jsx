import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PublicPortal from './components/PublicPortal';
import AdminDashboard from './components/AdminDashboard';
import AddMemberModal from './components/AddMemberModal';
import EditMemberModal from './components/EditMemberModal';
import MemberLookupModal from './components/MemberLookupModal';
import ArchivedMembersModal from './components/ArchivedMembersModal';
import PublicApplyModal from './components/PublicApplyModal';
import { api } from './services/api';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('public');
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [archivedMembers, setArchivedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Modal states
  const [isApplyOpen, setIsApplyOpen] = useState(false); // Public application
  const [isAddOpen, setIsAddOpen] = useState(false);     // Admin adding member
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch all members & stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersData, statsData, archivedData] = await Promise.all([
        api.getMembers(),
        api.getStats(),
        api.getArchivedMembers()
      ]);
      setMembers(membersData);
      setStats(statsData);
      setArchivedMembers(archivedData);
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast(err.message || 'Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle adding new member by Admin
  const handleMemberAdded = async (newMemberData) => {
    try {
      await api.createMember(newMemberData);
      showToast(`Member ${newMemberData.name} added successfully!`);
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to add member', 'error');
      throw err;
    }
  };

  // Handle editing member by Admin
  const handleMemberUpdated = async (id, updatedData) => {
    try {
      await api.updateMember(id, updatedData);
      showToast(`Member ${updatedData.name} updated successfully!`);
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to update member', 'error');
      throw err;
    }
  };

  // Handle paid months change by Admin (slider/dropdown)
  const handleUpdatePayment = async (id, monthsPaid) => {
    try {
      await api.updatePaidMonths(id, monthsPaid);
      // Quick local state update for instant UI response
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            const paid_amount = monthsPaid * 50;
            const due_amount = Math.max(0, m.elapsed_months * 50 - paid_amount);
            return {
              ...m,
              months_paid: monthsPaid,
              paid_amount,
              due_amount
            };
          }
          return m;
        })
      );
      // Re-fetch accurate database stats
      const newStats = await api.getStats();
      setStats(newStats);
      showToast(`Admin updated payment: ${monthsPaid} months paid (৳ ${monthsPaid * 50})`);
    } catch (err) {
      showToast(err.message || 'Failed to update payment. Admin authorization required.', 'error');
      await fetchData();
    }
  };

  // Handle deleting member by Admin
  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name} (${id})?`)) {
      return;
    }
    try {
      await api.deleteMember(id);
      showToast(`Member ${name} was deleted successfully.`);
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete member. Admin authorization required.', 'error');
    }
  };

  // Handle restore archived member by Admin
  const handleRestoreMember = async (id) => {
    try {
      await api.restoreMember(id);
      showToast(`Member ${id} restored to active roster.`);
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to restore member', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border ${
            toast.type === 'error'
              ? 'bg-red-900 text-white border-red-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            {toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenRegister={() => setIsApplyOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'public' ? (
          <PublicPortal
            onOpenLookup={() => setIsLookupOpen(true)}
            onOpenRegister={() => setIsApplyOpen(true)}
            onGoToAdmin={() => setActiveTab('admin')}
          />
        ) : (
          <AdminDashboard
            members={members}
            stats={stats}
            loading={loading}
            onRefresh={fetchData}
            onOpenAddMember={() => setIsAddOpen(true)}
            onOpenEditMember={(member) => {
              setEditingMember(member);
              setIsEditOpen(true);
            }}
            onOpenArchived={() => setIsArchivedOpen(true)}
            onDeleteMember={handleDeleteMember}
            onUpdatePayment={handleUpdatePayment}
            onBackToPublic={() => setActiveTab('public')}
          />
        )}
      </main>

      {/* Public Membership Application (Protected: random users cannot modify payment) */}
      <PublicApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onApplied={fetchData}
      />

      {/* Admin Member Creation Modal */}
      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onMemberAdded={handleMemberAdded}
      />

      {/* Admin Edit Modal */}
      <EditMemberModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingMember(null);
        }}
        member={editingMember}
        onMemberUpdated={handleMemberUpdated}
      />

      {/* Public Read-Only Dues Lookup */}
      <MemberLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
      />

      {/* Admin 1.5-Year Archive Modal */}
      <ArchivedMembersModal
        isOpen={isArchivedOpen}
        onClose={() => setIsArchivedOpen(false)}
        archivedMembers={archivedMembers}
        onRestore={handleRestoreMember}
      />
    </div>
  );
}
