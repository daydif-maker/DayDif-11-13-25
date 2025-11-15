#!/usr/bin/env node

/**
 * Run Migrations Against Remote Supabase Project
 * 
 * This script runs migrations directly against your remote Supabase project
 * using the Supabase Management API or by executing SQL via the client.
 */

// Try to load dotenv if available
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, that's okay
}

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Optional, for admin operations

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL');
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.error('\nPlease check your .env file.');
  process.exit(1);
}

// Use service role key if available (for admin operations), otherwise use anon key
const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function runMigration(filePath) {
  console.log(`\n📦 Running migration: ${path.basename(filePath)}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Migration file not found: ${filePath}`);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  
  try {
    // Split SQL into individual statements (basic splitting by semicolon)
    // Note: This is a simplified approach. For production, use a proper SQL parser
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`   Found ${statements.length} SQL statements`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.trim().startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      try {
        // Use RPC to execute SQL (if available) or use direct query
        // Note: Supabase client doesn't support raw SQL execution directly
        // We'll need to use the REST API or provide instructions
        console.log(`   ⚠️  Cannot execute raw SQL via client.`);
        console.log(`   📝 Please run this migration manually in Supabase Dashboard:`);
        console.log(`      File: ${filePath}`);
        break;
      } catch (error) {
        console.error(`   ❌ Error executing statement ${i + 1}:`, error.message);
        throw error;
      }
    }
  } catch (error) {
    console.error(`❌ Migration failed:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Running Supabase Migrations (Remote)...\n');
  console.log(`📡 Connecting to: ${supabaseUrl.replace(/\/\/.*@/, '//***@')}`);

  const migration0 = path.join(__dirname, '../supabase/migrations/000_enable_extensions.sql');
  const migration1 = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
  const migration2 = path.join(__dirname, '../supabase/migrations/002_storage_setup.sql');

  console.log('\n⚠️  Note: Supabase client cannot execute raw SQL directly.');
  console.log('   Migrations must be run via Supabase Dashboard SQL Editor.\n');
  console.log('📋 Instructions:');
  console.log('   1. Go to Supabase Dashboard → SQL Editor');
  console.log(`   2. Run ${migration0} once to enable pgcrypto (and uuid-ossp if available)`);
  console.log(`   3. Run ${migration1} to create tables/policies`);
  console.log(`   4. Run ${migration2} to create the storage bucket/policies\n`);

  console.log('📄 Migration Files:');
  console.log(`   1. ${migration0}`);
  console.log(`   2. ${migration1}`);
  console.log(`   3. ${migration2}\n`);

  // Test connection
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.log('⚠️  Connection test:', error.message);
    } else {
      console.log('✅ Successfully connected to Supabase');
    }
  } catch (error) {
    console.log('⚠️  Connection test failed:', error.message);
  }

  console.log('\n💡 Tip: You can copy the SQL files and paste them directly into the SQL Editor.');
  console.log('   Or use the Supabase CLI: supabase db push (if linked)');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runMigration };
