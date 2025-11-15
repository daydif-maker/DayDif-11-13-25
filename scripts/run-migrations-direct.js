#!/usr/bin/env node

/**
 * Run Migrations Directly
 * 
 * This script attempts to run migrations using Supabase CLI or provides
 * formatted SQL for easy copy-paste into Supabase Dashboard SQL Editor.
 */

// Try to load dotenv
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed
}

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MIGRATION_0 = path.join(__dirname, '../supabase/migrations/000_enable_extensions.sql');
const MIGRATION_1 = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
const MIGRATION_2 = path.join(__dirname, '../supabase/migrations/002_storage_setup.sql');

function formatSQLForCopy(sql) {
  // Remove comments that might cause issues, but keep structure
  return sql;
}

async function trySupabaseCLI() {
  console.log('🔄 Attempting to use Supabase CLI...\n');
  
  try {
    // Check if we're in a Supabase project directory
    const configPath = path.join(__dirname, '../supabase/config.toml');
    
    // Try to link if not already linked
    try {
      execSync('supabase status', { stdio: 'ignore', cwd: path.join(__dirname, '..') });
      console.log('✅ Supabase project is linked\n');
    } catch (error) {
      console.log('⚠️  Supabase project not linked locally.');
      console.log('   Migrations will be run via SQL Editor instead.\n');
      return false;
    }

    // Try to push migrations
    console.log('📦 Pushing migrations to Supabase...\n');
    execSync('supabase db push', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    
    console.log('\n✅ Migrations pushed successfully!');
    return true;
  } catch (error) {
    console.log('⚠️  Supabase CLI method failed.');
    return false;
  }
}

function printSQLInstructions() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 MIGRATION INSTRUCTIONS');
  console.log('='.repeat(70));
  console.log('\nSince Supabase CLI is not linked, please run migrations manually:\n');
  
  console.log('STEP 1: Enable Required Extensions');
  console.log('-'.repeat(70));
  console.log('1. Go to: https://app.supabase.com → Your Project → SQL Editor');
  console.log('2. Click "New query"');
  console.log('3. Copy the SQL below and run it once to enable pgcrypto + uuid-ossp (when available)\n');
  
  console.log('─'.repeat(70));
  console.log('EXTENSION SQL:');
  console.log('─'.repeat(70));
  console.log(fs.readFileSync(MIGRATION_0, 'utf8'));
  console.log('─'.repeat(70));
  
  console.log('\n\nSTEP 2: Run Migration 001 (Database Schema)');
  console.log('-'.repeat(70));
  console.log('1. Go to: https://app.supabase.com → Your Project → SQL Editor');
  console.log('2. Click "New query"');
  console.log('3. Copy the SQL below and paste it into the editor');
  console.log('4. Click "Run" (or press Cmd/Ctrl+Enter)\n');
  
  console.log('─'.repeat(70));
  console.log('MIGRATION 001 SQL:');
  console.log('─'.repeat(70));
  console.log(fs.readFileSync(MIGRATION_1, 'utf8'));
  console.log('─'.repeat(70));
  
  console.log('\n\nSTEP 3: Run Migration 002 (Storage Setup)');
  console.log('-'.repeat(70));
  console.log('1. In SQL Editor, click "New query" again');
  console.log('2. Copy the SQL below and paste it into the editor');
  console.log('3. Click "Run"\n');
  
  console.log('─'.repeat(70));
  console.log('MIGRATION 002 SQL:');
  console.log('─'.repeat(70));
  console.log(fs.readFileSync(MIGRATION_2, 'utf8'));
  console.log('─'.repeat(70));
  
  console.log('\n\nSTEP 4: Verify');
  console.log('-'.repeat(70));
  console.log('1. Go to Table Editor - should see 8 tables');
  console.log('2. Go to Storage - should see "lesson-audio" bucket');
  console.log('3. Run: npm run test:supabase\n');
}

function createSQLFiles() {
  // Create standalone SQL files for easy access
  const outputDir = path.join(__dirname, '../supabase/migrations-ready');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(outputDir, '000_enable_extensions.sql'),
    fs.readFileSync(MIGRATION_0, 'utf8')
  );
  
  fs.writeFileSync(
    path.join(outputDir, '001_initial_schema.sql'),
    fs.readFileSync(MIGRATION_1, 'utf8')
  );
  
  fs.writeFileSync(
    path.join(outputDir, '002_storage_setup.sql'),
    fs.readFileSync(MIGRATION_2, 'utf8')
  );
  
  console.log(`\n✅ SQL files ready in: ${outputDir}`);
  console.log('   You can copy these files and paste into Supabase SQL Editor\n');
}

async function main() {
  console.log('🚀 Running Supabase Migrations\n');
  
  // Check migration files exist
  if (!fs.existsSync(MIGRATION_0) || !fs.existsSync(MIGRATION_1) || !fs.existsSync(MIGRATION_2)) {
    console.error('❌ Migration files not found!');
    process.exit(1);
  }
  
  // Try Supabase CLI first
  const cliSuccess = await trySupabaseCLI();
  
  if (!cliSuccess) {
    // Create ready-to-use SQL files
    createSQLFiles();
    
    // Print instructions
    printSQLInstructions();
    
    console.log('\n💡 TIP: You can also link your project with:');
    console.log('   supabase link --project-ref your-project-ref');
    console.log('   Then run: supabase db push\n');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
