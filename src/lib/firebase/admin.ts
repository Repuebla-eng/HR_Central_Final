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
      const serviceAccount = JSON.parse(serviceAccountJson);
      return initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      // Fallback to local file for development using absolute path
      const saPath = path.resolve(process.cwd(), 'service-account.json');
      
      if (fs.existsSync(saPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
        return initializeApp({
          credential: cert(serviceAccount)
        });
      }
      
      console.warn('Firebase Admin: No service account found in environment or local file.');
      return null;
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    return null;
  }
}

const adminApp = getAdminApp();

export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminDb = adminApp ? getFirestore(adminApp) : null;
