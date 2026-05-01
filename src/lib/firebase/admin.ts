import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

function getAdminApp(): App | null {
  // 1. Return existing app if already initialized
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  try {
    // 2. Try Service Account from environment variables
    const serviceAccountJson = process.env.SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      console.log('Firebase Admin: Initializing with service account from environment.');
      return initializeApp({
        credential: cert(JSON.parse(serviceAccountJson))
      });
    }

    // 3. Try local service-account.json (Development)
    const saPath = path.resolve(process.cwd(), 'service-account.json');
    if (fs.existsSync(saPath)) {
      console.log('Firebase Admin: Initializing with local service-account.json');
      return initializeApp({
        credential: cert(JSON.parse(fs.readFileSync(saPath, 'utf8')))
      });
    }

    // 4. PRODUCTION FALLBACK: Use Application Default Credentials (ADC)
    // This is the standard way for Cloud Functions / Cloud Run
    console.log('Firebase Admin: Initializing with Application Default Credentials...');
    return initializeApp();
  } catch (error: any) {
    if (error.code === 'app/duplicate-app') {
      return getApps()[0];
    }
    console.error('Firebase Admin: Error during initialization:', error);
    return null;
  }
}

let adminAuth: ReturnType<typeof getAuth> | null = null;
let adminDb: ReturnType<typeof getFirestore> | null = null;
let initialized = false;

function initializeAdmin() {
  if (initialized) return { adminAuth, adminDb };
  
  const app = getAdminApp();
  if (app) {
    try {
      adminAuth = getAuth(app);
      adminDb = getFirestore(app);
      initialized = true;
      console.log('Firebase Admin: Services initialized successfully.');
    } catch (err) {
      console.error('Firebase Admin: Error initializing services:', err);
    }
  } else {
    console.error('Firebase Admin: Failed to obtain an Admin App instance.');
  }
  
  return { adminAuth, adminDb };
}

export const getAdminAuth = () => initializeAdmin().adminAuth;
export const getAdminDb = () => initializeAdmin().adminDb;
