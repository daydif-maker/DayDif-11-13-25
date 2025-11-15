#!/usr/bin/env node

/**
 * Quick Migration Runner
 * 
 * Runs the migration SQL directly via Supabase Dashboard instructions
 * or via Supabase CLI if linked.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXTENSION_FILE = path.join(__dirname, '../supabase/migrations/000_enable_extensions.sql');
const MIGRATION_FILE = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
const STORAGE_MIGRATION_FILE = path.join(__dirname, '../supabase/migrations/002_storage_setup.sql');

function printMigrationInstructions() {
  console.log('\n📋 To run migrations manually:');
  console.log('\n1. Go to Supabase Dashboard → SQL Editor');
  console.log(`2. Copy contents of: ${EXTENSION_FILE}`);
  console.log('3. Paste and run the SQL to enable required extensions');
  console.log(`4. Copy contents of: ${MIGRATION_FILE}`);
  console.log('5. Paste and run the SQL');
  console.log(`6. Then copy contents of: ${STORAGE_MIGRATION_FILE}`);
  console.log('7. Paste and run the SQL\n');
}

async function main() {
  console.log('🚀 Running Supabase migrations...\n');
  
  // Check if migration files exist
  if (!fs.existsSync(EXTENSION_FILE)) {
    console.error(`❌ Extension migration file not found: ${EXTENSION_FILE}`);
    process.exit(1);
  }

  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error(`❌ Migration file not found: ${MIGRATION_FILE}`);
    process.exit(1);
  }

  if (!fs.existsSync(STORAGE_MIGRATION_FILE)) {
    console.error(`❌ Storage migration file not found: ${STORAGE_MIGRATION_FILE}`);
    process.exit(1);
  }

  // Try to use Supabase CLI if available
  try {
    // Check if Supabase is linked
    execSync('supabase status', { stdio: 'ignore' });
    
    console.log('📦 Using Supabase CLI to run migrations...');
    
    // Run migrations via Supabase CLI
    execSync('supabase db push', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    
    console.log('\n✅ Migrations completed successfully!');
  } catch (error) {
    console.log('⚠️  Supabase CLI not linked or not available.');
    printMigrationInstructions();
    
    // Print the SQL files for easy copying
    console.log('\n📄 Migration SQL Files:');
    console.log(`\n--- ${EXTENSION_FILE} ---\n`);
    console.log(fs.readFileSync(EXTENSION_FILE, 'utf8'));
    console.log(`\n--- ${MIGRATION_FILE} ---\n`);
    console.log(fs.readFileSync(MIGRATION_FILE, 'utf8'));
    console.log(`\n--- ${STORAGE_MIGRATION_FILE} ---\n`);
    console.log(fs.readFileSync(STORAGE_MIGRATION_FILE, 'utf8'));
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
