const admin = require('firebase-admin');

// TODO: You will need to download your Service Account JSON file from Firebase Console
// (Project Settings > Service Accounts > Generate New Private Key)
// and save it as "firebaseServiceAccountKey.json" in the server/config directory.
// For security, make sure to add it to .gitignore!

try {
  const serviceAccount = require('./firebaseServiceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.log('Firebase Admin SDK not initialized yet. Waiting for serviceAccountKey.json...');
}

module.exports = admin;
