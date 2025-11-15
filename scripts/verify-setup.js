#!/usr/bin/env node

/**
 * Verify Supabase Setup
 * 
 * Checks if migrations have been run and storage is configured correctly.
 */

// Try to load dotenv if available
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, that's okay
}

const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verifying Supabase Setup...\n');

// Check environment variables
console.log('1️⃣  Checking environment variables...');
if (!supabaseUrl || supabaseUrl.includes('example') || supabaseUrl.includes('placeholder')) {
  console.log('   ❌ EXPO_PUBLIC_SUPABASE_URL is not configured');
  console.log('      Update your .env file with your Supabase project URL');
} else {
  console.log('   ✅ EXPO_PUBLIC_SUPABASE_URL is set');
}

if (!supabaseAnonKey || supabaseAnonKey.includes('placeholder')) {
  console.log('   ❌ EXPO_PUBLIC_SUPABASE_ANON_KEY is not configured');
  console.log('      Update your .env file with your Supabase anon key');
} else {
  console.log('   ✅ EXPO_PUBLIC_SUPABASE_ANON_KEY is set');
}

// Check migration files exist
console.log('\n2️⃣  Checking migration files...');
const migration1 = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
const migration2 = path.join(__dirname, '../supabase/migrations/002_storage_setup.sql');

if (fs.existsSync(migration1)) {
  console.log('   ✅ 001_initial_schema.sql exists');
} else {
  console.log('   ❌ 001_initial_schema.sql not found');
}

if (fs.existsSync(migration2)) {
  console.log('   ✅ 002_storage_setup.sql exists');
} else {
  console.log('   ❌ 002_storage_setup.sql not found');
}

// Check app.json for scheme
console.log('\n3️⃣  Checking app configuration...');
const appJsonPath = path.join(__dirname, '../app.json');
if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  if (appJson.expo?.scheme === 'daydif') {
    console.log('   ✅ Deep linking scheme configured (daydif://)');
  } else {
    console.log('   ⚠️  Deep linking scheme not configured');
  }
}

console.log('\n📋 Next Steps:');
console.log('   1. Update .env with your Supabase credentials');
console.log('   2. Run migrations in Supabase Dashboard SQL Editor');
console.log('   3. Configure OAuth providers');
console.log('   4. Run: npm run test:supabase');

console.log('\n📚 See SUPABASE_QUICK_START.md for detailed instructions.\n');

