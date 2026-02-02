import * as admin from 'firebase-admin';

// This guard prevents re-initializing the admin app in serverless environments
// where files can be re-evaluated.
if (!admin.apps.length) {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  let serviceAccount;

  if (serviceAccountString) {
      try {
          serviceAccount = JSON.parse(serviceAccountString);
      } catch (error) {
          console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY from environment variables.", error);
          throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY.");
      }
  } else {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please provide it in your .env.local file.");
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Failed to parse or initialize Firebase Admin SDK:", error);
    throw new Error("Could not initialize Firebase Admin SDK. Check your service account credentials.");
  }
}

// Export the initialized services for use in other backend files.
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
