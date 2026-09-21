const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

let firestore = null;
let isFirebaseEnabled = false;

const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');

try {
  let credential = null;

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, 'utf8')
    );

    if (
      !serviceAccount.project_id ||
      !serviceAccount.client_email ||
      !serviceAccount.private_key
    ) {
      throw new Error('serviceAccountKey.json is missing required fields');
    }

    credential = cert(serviceAccount);
    console.log(
      `Loading Firebase credentials from serviceAccountKey.json (Project: ${serviceAccount.project_id})...`
    );
  } else {
    const {
      FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY
    } = process.env;

    if (
      FIREBASE_PROJECT_ID &&
      FIREBASE_CLIENT_EMAIL &&
      FIREBASE_PRIVATE_KEY
    ) {
      credential = cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      });

      console.log('Loading Firebase credentials from environment variables...');
    }
  }

  if (credential) {
    const app =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({ credential });

    firestore = getFirestore(app);
    isFirebaseEnabled = true;

    console.log('🔥 Firebase Cloud Firestore connected successfully!');
  } else {
    console.log(
      'No Firebase credentials found. Running in local SQLite mode (club.db).'
    );
  }
} catch (err) {
  console.warn('Firebase initialization skipped/failed:', err.message);
  console.log('Continuing with local SQLite database.');
}

module.exports = {
  firestore,
  isFirebaseEnabled
};
