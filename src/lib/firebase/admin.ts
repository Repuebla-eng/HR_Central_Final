import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // We try to get the service account from environment variables first
    // This is safer for production deployments (Firebase App Hosting)
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // Fallback to local file for development if environment variable is not set
      // WARNING: Make sure service-account.json is in your .gitignore
      const serviceAccount = require('../../../service-account.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
