require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const privateKeyStr = process.env.FIREBASE_PRIVATE_KEY;
if (!privateKeyStr) {
  console.error("No FIREBASE_PRIVATE_KEY found in .env.local");
  process.exit(1);
}

// Handle literal \n if they exist
const privateKey = privateKeyStr.replace(/\\n/g, '\n');

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

async function fixKevin() {
  const email = 'kegeorge5002@gmail.com';
  console.log(`Looking for user with email: ${email}`);
  
  try {
    const userRecord = await auth.getUserByEmail(email);
    console.log(`Found user! UID: ${userRecord.uid}`);
    
    console.log('Updating Firebase Auth displayName to "Kevin George"...');
    await auth.updateUser(userRecord.uid, {
      displayName: 'Kevin George'
    });
    
    console.log('Updating Firestore users collection...');
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.set({
      firstName: 'Kevin',
      lastName: 'George'
    }, { merge: true });
    
    console.log('Successfully updated Kevin George!');
  } catch (error) {
    console.error('Error fixing user:', error);
  }
}

fixKevin();
