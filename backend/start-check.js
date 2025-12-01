/**
 * Pre-startup Check Script
 * Verifies all required files and configurations before starting the server
 */

const fs = require('fs');
const path = require('path');

console.log('Checking prerequisites...\n');

let hasErrors = false;

// Check serviceAccountKey.json
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ERROR: serviceAccountKey.json not found!');
  console.error('   Please download your Firebase service account key from:');
  console.error('   Firebase Console → Project Settings → Service Accounts');
  console.error('   Save it as: backend/serviceAccountKey.json\n');
  hasErrors = true;
} else {
  console.log('✅ serviceAccountKey.json found');
}

// Check .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.warn('⚠️  WARNING: .env file not found!');
  console.warn('   Creating .env from .env.example...');
  
  const envExamplePath = path.join(__dirname, '.env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('   ✅ .env file created. Please update it with your values.\n');
  } else {
    console.error('   ❌ .env.example not found. Please create .env manually.\n');
    hasErrors = true;
  }
} else {
  console.log('✅ .env file found');
}

// Check node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.warn('⚠️  WARNING: node_modules not found!');
  console.warn('   Run: npm install\n');
} else {
  console.log('✅ node_modules found');
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.error('\n❌ Setup incomplete! Please fix the errors above.\n');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed! Starting server...\n');
}

