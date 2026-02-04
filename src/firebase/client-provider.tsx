'use client';

import { ReactNode } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

// Initialize Firebase and get the SDKs
const { firebaseApp, auth, firestore } = initializeFirebase();

/**
 * A client-side component to provide the Firebase context.
 * It initializes Firebase and wraps its children with the FirebaseProvider.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
