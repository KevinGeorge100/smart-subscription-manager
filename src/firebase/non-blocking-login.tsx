'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

function handleAuthError(error: any) {
  console.error("Authentication error:", error);
  let description = "An unknown error occurred.";
  // Firebase provides structured error codes.
  switch (error.code) {
    case 'auth/invalid-email':
      description = 'Please enter a valid email address.';
      break;
    case 'auth/user-disabled':
      description = 'This user account has been disabled.';
      break;
    case 'auth/user-not-found': // Often replaced by invalid-credential
    case 'auth/wrong-password': // Often replaced by invalid-credential
    case 'auth/invalid-credential':
      description = 'Incorrect email or password. Please check your credentials and try again.';
      break;
    case 'auth/email-already-in-use':
      description = 'This email is already in use by another account.';
      break;
    case 'auth/weak-password':
      description = 'The password is too weak. Please use a stronger password.';
      break;
    default:
      description = `An unexpected error occurred: ${error.message}`;
  }
  toast({
    variant: "destructive",
    title: "Authentication Failed",
    description: description,
  });
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance).catch(handleAuthError);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password).catch(handleAuthError);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password).catch(handleAuthError);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate Google sign-in via popup (non-blocking). Creates Firestore user doc on first sign-in. */
export function initiateGoogleSignIn(authInstance: Auth, firestoreInstance?: Firestore): void {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');

  signInWithPopup(authInstance, provider)
    .then(async (result) => {
      // Create Firestore user doc on first Google sign-in
      if (firestoreInstance) {
        const userRef = doc(firestoreInstance, 'users', result.user.uid);
        const existing = await getDoc(userRef);
        if (!existing.exists()) {
          const nameParts = (result.user.displayName ?? '').split(' ');
          await setDoc(userRef, {
            id: result.user.uid,
            firstName: nameParts[0] ?? '',
            lastName: nameParts.slice(1).join(' ') ?? '',
            email: result.user.email,
          }, { merge: true });
        }
      }
    })
    .catch(handleAuthError);
}
