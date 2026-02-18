import admin from 'firebase-admin';

/**
 * Firebase Admin SDK — Lazy Initialization
 *
 * Initialization is deferred to first access to avoid build-time errors
 * when env vars (FIREBASE_PROJECT_ID, etc.) are not available.
 */
function ensureInitialized() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Firebase Admin SDK: Missing environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).'
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }
  return admin;
}

/** Lazily initialized Firestore instance */
export function getFirestoreAdmin() {
  return ensureInitialized().firestore();
}

/** Lazily initialized Auth instance */
export function getAuthAdmin() {
  return ensureInitialized().auth();
}

// Backwards-compatible exports (lazy getters)
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_, prop) {
    return (getFirestoreAdmin() as any)[prop];
  },
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_, prop) {
    return (getAuthAdmin() as any)[prop];
  },
});
