/**
 * Firebase Configuration and Initialization
 * Handles Firestore database and Storage connections
 * Supports both local file and environment variable (for AWS deployment)
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;

// Check if Firebase key is provided via environment variable (for AWS/cloud deployment)
if (process.env.FIREBASE_KEY_BASE64) {
  try {
    // Decode base64 encoded service account key from environment variable
    const keyBuffer = Buffer.from(process.env.FIREBASE_KEY_BASE64, 'base64');
    serviceAccount = JSON.parse(keyBuffer.toString('utf-8'));
    console.log('Firebase key loaded from environment variable');
  } catch (error) {
    console.error('Error parsing Firebase key from environment variable:', error.message);
    process.exit(1);
  }
} else {
  // Fallback to local file (for local development)
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('ERROR: serviceAccountKey.json file not found!');
    console.error('Please download your Firebase service account key and place it in the backend/ directory.');
    console.error('Or set FIREBASE_KEY_BASE64 environment variable for cloud deployment.');
    console.error('See README.md or DEPLOYMENT.md for setup instructions.');
    process.exit(1);
  }
  
  // Check if file is empty
  const fileStats = fs.statSync(serviceAccountPath);
  if (fileStats.size === 0) {
    console.error('ERROR: serviceAccountKey.json file is empty!');
    console.error('Please download your Firebase service account key and place it in the backend/ directory.');
    console.error('Or set FIREBASE_KEY_BASE64 environment variable for cloud deployment.');
    process.exit(1);
  }
  
  try {
    serviceAccount = require(serviceAccountPath);
    console.log('Firebase key loaded from local file');
  } catch (error) {
    console.error('ERROR: Failed to parse serviceAccountKey.json:', error.message);
    console.error('Please ensure the file contains valid JSON.');
    console.error('Or set FIREBASE_KEY_BASE64 environment variable for cloud deployment.');
    process.exit(1);
  }
}

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: serviceAccount.project_id + '.appspot.com'
  });
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error.message);
  process.exit(1);
}

// Get Firestore database instance
const db = admin.firestore();

// Get Storage bucket instance
const bucket = admin.storage().bucket();

module.exports = {
  db,
  bucket,
  admin
};

