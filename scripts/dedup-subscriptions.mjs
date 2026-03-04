/**
 * One-off script: removes duplicate subscriptions from Firestore.
 * Keeps the FIRST occurrence (oldest createdAt) and deletes the rest.
 * Run: node --env-file=.env.local scripts/dedup-subscriptions.mjs
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY');
    process.exit(1);
}

if (!getApps().length) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}
const db = getFirestore();

const usersSnap = await db.collection('users').get();
console.log(`Found ${usersSnap.size} user(s).`);

for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const subsSnap = await db.collection('users').doc(userId).collection('subscriptions').get();
    console.log(`  User ${userId}: ${subsSnap.size} subscriptions.`);

    const seen = new Map(); // normalizedName -> docRef of first seen
    let deleted = 0;

    // Sort by createdAt ascending so we keep the oldest
    const sorted = subsSnap.docs.slice().sort((a, b) => {
        const aTime = a.data().createdAt?.toMillis?.() ?? 0;
        const bTime = b.data().createdAt?.toMillis?.() ?? 0;
        return aTime - bTime;
    });

    for (const docSnap of sorted) {
        const name = (docSnap.data().name || '').toLowerCase().trim();
        if (seen.has(name)) {
            console.log(`    Deleting duplicate: "${docSnap.data().name}" (${docSnap.id})`);
            await docSnap.ref.delete();
            deleted++;
        } else {
            seen.set(name, docSnap.ref);
        }
    }

    console.log(`  → Removed ${deleted} duplicates for user ${userId}.`);
}

console.log('Done.');
