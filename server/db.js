const { firestore, isFirebaseEnabled } = require('./firebase');

// Ensure Firebase is configured before performing database operations
function checkFirebase() {
  if (!isFirebaseEnabled || !firestore) {
    throw new Error('Firebase Firestore is not initialized or disabled. Please check serviceAccountKey.json.');
  }
}

// Calculate elapsed months from joined_date
function calculateElapsedMonths(joinedDateStr) {
  if (!joinedDateStr) return 1;
  const join = new Date(joinedDateStr);
  const now = new Date();
  if (isNaN(join.getTime())) return 1;

  let months = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
  if (now.getDate() >= join.getDate()) {
    months += 1;
  }
  return Math.max(1, months);
}

// Calculate financial details for a member
function enrichMemberFinancials(member) {
  const elapsedMonths = calculateElapsedMonths(member.joined_date);
  const cappedElapsed = Math.min(18, elapsedMonths);
  const paidMonths = member.months_paid || 0;
  
  const paidAmount = paidMonths * 50;
  const expectedAmount = cappedElapsed * 50;
  const dueAmount = Math.max(0, expectedAmount - paidAmount);

  return {
    ...member,
    elapsed_months: cappedElapsed,
    actual_elapsed: elapsedMonths,
    paid_amount: paidAmount,
    expected_amount: expectedAmount,
    due_amount: dueAmount,
    is_expired: elapsedMonths > 18
  };
}

// Firebase Cloud Sync Helpers
async function syncMemberToFirebase(member) {
  checkFirebase();
  try {
    await firestore.collection('members').doc(member.id).set({
      ...member,
      last_synced: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Firebase sync error for', member.id, err.message);
  }
}

async function removeMemberFromFirebase(id) {
  checkFirebase();
  try {
    await firestore.collection('members').doc(id).delete();
  } catch (err) {
    console.error('Firebase delete error for', id, err.message);
  }
}

async function archiveMemberInFirebase(member, reason) {
  checkFirebase();
  try {
    await firestore.collection('archived_members').doc(member.id).set({
      ...member,
      archived_at: new Date().toISOString(),
      reason
    });
    await firestore.collection('members').doc(member.id).delete();
  } catch (err) {
    console.error('Firebase archive error for', member.id, err.message);
  }
}

// Check and auto-delete members older than 1.5 years (18 months)
async function autoPurgeExpiredMembers() {
  checkFirebase();
  const snapshot = await firestore.collection('members').get();

  for (const doc of snapshot.docs) {
    const m = { id: doc.id, ...doc.data() };
    const elapsed = calculateElapsedMonths(m.joined_date);

    if (elapsed > 18) {
      console.log(`Auto-deleting expired member (${elapsed} months > 18 months): ${m.name} (${m.id})`);
      await archiveMemberInFirebase(m, `Completed 1.5-year limit (${elapsed} months)`);
    }
  }
}

// Firestore direct database helpers mimicking previous query methods
const run = async (collectionName, action, payload = {}) => {
  checkFirebase();
  const colRef = firestore.collection(collectionName);
  
  if (action === 'insert' || action === 'update') {
    const { id, ...data } = payload;
    if (!id) throw new Error('Document ID is required for insert/update.');
    await colRef.doc(id).set(data, { merge: true });
    return { id };
  } 
  
  if (action === 'delete') {
    if (!payload.id) throw new Error('Document ID is required for deletion.');
    await colRef.doc(payload.id).delete();
    return { id: payload.id };
  }

  throw new Error(`Unsupported action: ${action}`);
};

const get = async (collectionName, id) => {
  checkFirebase();
  const docRef = await firestore.collection(collectionName).doc(id).get();
  if (!docRef.exists) return null;
  return { id: docRef.id, ...docRef.data() };
};

const all = async (collectionName) => {
  checkFirebase();
  const snapshot = await firestore.collection(collectionName).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Initialize Firestore collections and seed initial data
async function initDb() {
  checkFirebase();
  console.log('Connected to Firebase Cloud Firestore.');

  const snapshot = await firestore.collection('members').limit(1).get();
  if (snapshot.empty) {
    console.log('Seeding initial SRCC Business Club members into Firestore...');

    const today = new Date();
    const formatDate = (monthsAgo) => {
      const d = new Date(today);
      d.setMonth(d.getMonth() - monthsAgo);
      return d.toISOString().split('T')[0];
    };

    const initialMembers = [
      { id: 'SRCC-001', name: 'Tanvir Ahmed', role: 'President', number: '01711223344', blood: 'B+', months_paid: 10, joined_date: formatDate(10) },
      { id: 'SRCC-002', name: 'Nusrat Jahan', role: 'Vice President', number: '01819283746', blood: 'A+', months_paid: 8, joined_date: formatDate(8) },
      { id: 'SRCC-003', name: 'Shafiqul Islam', role: 'General Secretary', number: '01912345678', blood: 'O+', months_paid: 6, joined_date: formatDate(6) },
      { id: 'SRCC-004', name: 'Farhana Yasmin', role: 'Treasurer', number: '01611224455', blood: 'AB+', months_paid: 5, joined_date: formatDate(5) },
      { id: 'SRCC-005', name: 'Abrar Fahim', role: 'Executive', number: '01511223388', blood: 'B+', months_paid: 2, joined_date: formatDate(4) },
      { id: 'SRCC-006', name: 'Mehnaz Chowdhury', role: 'Executive', number: '01799887766', blood: 'O-', months_paid: 3, joined_date: formatDate(3) },
      { id: 'SRCC-007', name: 'Sakib Al Hasan', role: 'General Member', number: '01833445566', blood: 'A-', months_paid: 1, joined_date: formatDate(2) },
      { id: 'SRCC-008', name: 'Lamia Rahman', role: 'General Member', number: '01977665544', blood: 'B-', months_paid: 0, joined_date: formatDate(1) },
      { id: 'SRCC-000', name: 'Kazi Raihan (Senior Alumni)', role: 'Advisory Member', number: '01700112233', blood: 'O+', months_paid: 18, joined_date: formatDate(20) },
    ];

    for (const member of initialMembers) {
      await syncMemberToFirebase(member);
    }

    console.log('Firestore seeding completed.');
  }

  // Run auto-purge on startup
  await autoPurgeExpiredMembers();
}

module.exports = {
  db: firestore,
  run,
  get,
  all,
  initDb,
  calculateElapsedMonths,
  enrichMemberFinancials,
  autoPurgeExpiredMembers,
  syncMemberToFirebase,
  removeMemberFromFirebase,
  archiveMemberInFirebase
};