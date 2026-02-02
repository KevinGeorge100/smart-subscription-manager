'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
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
    case 'auth/user-not-found':
      description = 'No user found with this email.';
      break;
    case 'auth/wrong-password':
      description = 'Incorrect password. Please try again.';
      break;
    case 'auth/email-already-in-use':
        description = 'This email is already in use by another account.';
        break;
    case 'auth/weak-password':
        description = 'The password is too weak. Please use a stronger password.';
        break;
    default:
      description = error.message;
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
