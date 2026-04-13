import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

function getAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApp();
  }

  try {
    // Priority 1: SERVICE_ACCOUNT_KEY (Non-reserved name for Firebase Functions)
    // Priority 2: FIREBASE_SERVICE_ACCOUNT (Legacy)
    const serviceAccountJson = process.env.SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountJson) {
      console.log('Firebase Admin: Initializing with service account from environment.');
      const serviceAccount = JSON.parse(serviceAccountJson);
      return initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      // Fallback to local file for development using absolute path
      const saPath = path.resolve(process.cwd(), 'service-account.json');
      console.log('Firebase Admin: Checking local service account file at:', saPath);
      
      if (fs.existsSync(saPath)) {
        console.log('Firebase Admin: Local service account file found. Initializing...');
        const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
        return initializeApp({
          credential: cert(serviceAccount)
        });
      }
      
      // PRODUCTION FALLBACK: Try initializing with default credentials
      // This works automatically within Google Cloud environments like Cloud Functions (Hosting Frameworks)
      try {
        console.log('Firebase Admin: Attempting default initialization...');
        return initializeApp();
      } catch (defaultError) {
        console.warn('Firebase Admin: No service account found and default initialization failed.', defaultError);
        return null;
      }
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    return null;
  }
}

const adminApp = getAdminApp();

export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminDb = adminApp ? getFirestore(adminApp) : null;
