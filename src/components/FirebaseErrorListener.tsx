'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * Logs the error to the console instead of throwing it, which would crash the
 * entire React tree. Firestore permission errors (e.g., on new empty accounts)
 * are non-fatal and should never take down the whole UI.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (err: FirestorePermissionError) => {
      // Log for debugging — this is intentionally NOT thrown.
      // Throwing here crashes the entire app for non-fatal Firestore errors.
      console.warn('[SubZero] Firestore permission error (non-fatal):', err.message);
    };

    errorEmitter.on('permission-error', handleError);
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null;
}
