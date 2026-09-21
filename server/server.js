const express = require('express');
const cors = require('cors');
const { 
  initDb, 
  all, 
  get, 
  run, 
  enrichMemberFinancials, 
  autoPurgeExpiredMembers,
  syncMemberToFirebase,
  removeMemberFromFirebase
} = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB on server start
initDb().catch((err) => {
  console.error('Failed to initialize database:', err);
});

// Admin authentication configuration
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'srccbc2017';

// Admin authentication middleware to restrict modifying operations
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers['x-admin-key'] || req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Unauthorized: Only authorized SRCC Business Club admins can perform this action.' 
    });
  }
  
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (token !== ADMIN_PASSWORD) {
    return res.status(403).json({ 
      error: 'Forbidden: Invalid admin credentials.' 
    });
  }
  next();
};

// Admin Login / Verification endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ 
      success: true, 
      token: ADMIN_PASSWORD, 
      message: 'Admin authentication successful' 
    });
  }
  return res.status(401).json({ 
    error: 'Incorrect admin password. Only club administrators are authorized.' 
  });
});

// Middleware to automatically run 1.5-year auto-purge
app.use(async (req, res, next) => {
  try {
    if (req.method === 'GET' && req.path.startsWith('/api/members')) {
      await autoPurgeExpiredMembers();
    }
  } catch (err) {
    console.error('Auto purge error:', err);
  }
  next();
});

// 1. GET /api/members - Fetch all members with calculations and optional filters
app.get('/api/members', async (req, res) => {
  try {
    const { search, role, blood, status } = req.query;

    const rawMembers = await all('members');
    let members = rawMembers.map(enrichMemberFinancials);

    // Filter by search (Role, ID, or Name)
    if (search) {
      const term = search.toLowerCase().trim();
      members = members.filter(m => 
        m.name.toLowerCase().includes(term) ||
        m.id.toLowerCase().includes(term) ||
        m.role.toLowerCase().includes(term)
      );
    }

    // Filter by role
    if (role && role !== 'ALL') {
      members = members.filter(m => m.role === role);
    }

    // Filter by blood group
    if (blood && blood !== 'ALL') {
      members = members.filter(m => m.blood === blood);
    }

    // Filter by due status
    if (status === 'DUE') {
      members = members.filter(m => m.due_amount > 0);
    } else if (status === 'CLEARED') {
      members = members.filter(m => m.due_amount <= 0);
    }

    res.json(members);
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// 2. GET /api/members/lookup - Public status & due check by ID or Phone
app.get('/api/members/lookup', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Please provide Member ID or Phone number' });
    }

    const trimmed = query.trim().toLowerCase();
    const allMembers = await all('members');
    const row = allMembers.find(
      m => m.id.toLowerCase() === trimmed || m.number === query.trim()
    );

    if (!row) {
      const allArchived = await all('archived_members');
      const archived = allArchived.find(
        m => m.id.toLowerCase() === trimmed || m.number === query.trim()
      );
      if (archived) {
        return res.status(404).json({
          error: `Member ${archived.name} completed the 1.5-year club tenure and has graduated from active membership.`
        });
      }
      return res.status(404).json({ error: 'No active member found with this ID or phone number.' });
    }

    res.json(enrichMemberFinancials(row));
  } catch (err) {
    console.error('Lookup error:', err);
    res.status(500).json({ error: 'Error during lookup' });
  }
});

// 3. POST /api/apply - Public membership application
app.post('/api/apply', async (req, res) => {
  try {
    const { name, number, blood, role } = req.body;
    if (!name || !number) {
      return res.status(400).json({ error: 'Full name and phone number are required.' });
    }

    const autoId = `SRCC-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];

    const newMember = {
      id: autoId,
      name: name.trim(),
      role: role ? role.trim() : 'General Member',
      number: number.trim(),
      blood: blood ? blood.trim() : 'B+',
      months_paid: 0,
      joined_date: today
    };

    await syncMemberToFirebase(newMember);

    res.status(201).json({
      success: true,
      message: `Welcome to SRCC Business Club! Your assigned Member ID is ${autoId}. Monthly fee is 50 TK/month.`,
      member: enrichMemberFinancials(newMember)
    });
  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// 4. POST /api/members - Create a new member (Admin Only)
app.post('/api/members', requireAdmin, async (req, res) => {
  try {
    const { id, name, role, number, blood, joined_date, months_paid } = req.body;

    if (!id || !name || !number) {
      return res.status(400).json({ error: 'ID, Name, and Phone Number are required.' });
    }

    const existing = await get('members', id.trim());
    if (existing) {
      return res.status(400).json({ error: `A member with ID "${id}" already exists.` });
    }

    const cleanDate = joined_date || new Date().toISOString().split('T')[0];
    const initialPaid = Math.min(18, Math.max(0, parseInt(months_paid, 10) || 0));

    const memberData = {
      id: id.trim(),
      name: name.trim(),
      role: role ? role.trim() : 'General Member',
      number: number.trim(),
      blood: blood ? blood.trim() : 'B+',
      months_paid: initialPaid,
      joined_date: cleanDate
    };

    await syncMemberToFirebase(memberData);
    await autoPurgeExpiredMembers();

    const created = await get('members', id.trim());
    if (created) {
      res.status(201).json(enrichMemberFinancials(created));
    } else {
      res.status(201).json({ message: 'Member added (auto-archived due to tenure limit)' });
    }
  } catch (err) {
    console.error('Error creating member:', err);
    res.status(500).json({ error: err.message || 'Failed to create member' });
  }
});

// 5. PUT /api/members/:id - Update member details (Admin Only)
app.put('/api/members/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, number, blood, joined_date, months_paid } = req.body;

    const existing = await get('members', id);
    if (!existing) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    const updatedMonthsPaid = months_paid !== undefined 
      ? Math.min(18, Math.max(0, parseInt(months_paid, 10))) 
      : existing.months_paid;

    const updatedMember = {
      id,
      name: name ? name.trim() : existing.name,
      role: role ? role.trim() : existing.role,
      number: number ? number.trim() : existing.number,
      blood: blood ? blood.trim() : existing.blood,
      joined_date: joined_date || existing.joined_date,
      months_paid: updatedMonthsPaid
    };

    await syncMemberToFirebase(updatedMember);
    await autoPurgeExpiredMembers();

    const updated = await get('members', id);
    if (updated) {
      res.json(enrichMemberFinancials(updated));
    } else {
      res.json({ message: 'Member updated and moved to archive per 1.5-year limit.' });
    }
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// 6. PATCH /api/members/:id/payment - Slider/dropdown update for paid months (Admin Only)
app.patch('/api/members/:id/payment', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { months_paid } = req.body;

    if (months_paid === undefined || months_paid < 0 || months_paid > 18) {
      return res.status(400).json({ error: 'Months paid must be between 0 and 18.' });
    }

    const existing = await get('members', id);
    if (!existing) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    const updatedMember = { ...existing, months_paid };
    await syncMemberToFirebase(updatedMember);

    res.json(enrichMemberFinancials(updatedMember));
  } catch (err) {
    console.error('Payment update error:', err);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// 7. DELETE /api/members/:id - Delete a member (Admin Only)
app.delete('/api/members/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await get('members', id);
    if (!existing) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    await removeMemberFromFirebase(id);
    res.json({ success: true, message: `Member ${existing.name} (${id}) deleted successfully.` });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// 8. GET /api/stats - Aggregate stats for admin dashboard
app.get('/api/stats', async (req, res) => {
  try {
    await autoPurgeExpiredMembers();
    const rawMembers = await all('members');
    const members = rawMembers.map(enrichMemberFinancials);
    const archived = await all('archived_members');

    const totalPaidAmount = members.reduce((sum, m) => sum + m.paid_amount, 0);
    const totalDueAmount = members.reduce((sum, m) => sum + m.due_amount, 0);
    const totalExpectedAmount = members.reduce((sum, m) => sum + m.expected_amount, 0);

    const expiringSoon = members.filter(m => m.actual_elapsed >= 16).length;

    const bloodCounts = {};
    members.forEach(m => {
      bloodCounts[m.blood] = (bloodCounts[m.blood] || 0) + 1;
    });

    res.json({
      totalMembers: members.length,
      totalPaidAmount,
      totalDueAmount,
      totalExpectedAmount,
      expiringSoon,
      archivedCount: archived.length,
      bloodCounts
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// 9. GET /api/archived - List 1.5-year auto-deleted members
app.get('/api/archived', async (req, res) => {
  try {
    const archived = await all('archived_members');
    res.json(archived);
  } catch (err) {
    console.error('Archived fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch archived members' });
  }
});

// 10. POST /api/archived/:id/restore - Restore an archived member (Admin Only)
app.post('/api/archived/:id/restore', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const archived = await get('archived_members', id);
    if (!archived) {
      return res.status(404).json({ error: 'Archived member not found.' });
    }

    const today = new Date().toISOString().split('T')[0];
    const restoredMember = {
      id: archived.id,
      name: archived.name,
      role: archived.role,
      number: archived.number,
      blood: archived.blood,
      months_paid: 0,
      joined_date: today
    };

    await syncMemberToFirebase(restoredMember);
    await run('archived_members', 'delete', { id });

    res.json({ success: true, message: `Member ${archived.name} restored to active roster with renewed tenure.` });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ error: 'Failed to restore member' });
  }
});

app.listen(PORT, () => {
  console.log(`SRCC Business Club Server running on port ${PORT}`);
});