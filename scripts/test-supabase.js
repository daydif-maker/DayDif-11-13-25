#!/usr/bin/env node

/**
 * Supabase Test Script
 * 
 * Tests authentication and data flows:
 * 1. Test database connection
 * 2. Test authentication (sign up, sign in, sign out)
 * 3. Test profile creation
 * 4. Test data CRUD operations
 * 5. Test storage bucket access
 */

// Try to load dotenv if available (optional)
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, that's okay - use environment variables directly
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL');
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.error('\nPlease create a .env file with these variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials (will be cleaned up)
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

let testUserId = null;
let testSession = null;

async function testConnection() {
  console.log('🔌 Testing database connection...');
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      throw error;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testSignUp() {
  console.log('\n📝 Testing user sign up...');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          display_name: 'Test User',
        },
      },
    });

    if (error) throw error;

    testUserId = data.user?.id;
    testSession = data.session;
    
    console.log('✅ Sign up successful');
    console.log(`   User ID: ${testUserId}`);
    return true;
  } catch (error) {
    console.error('❌ Sign up failed:', error.message);
    return false;
  }
}

async function testProfileCreation() {
  console.log('\n👤 Testing profile creation...');
  
  try {
    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (error) throw error;

    console.log('✅ Profile created automatically');
    console.log(`   Display Name: ${data.display_name}`);
    console.log(`   Avatar Color Seed: ${data.avatar_color_seed}`);
    return true;
  } catch (error) {
    console.error('❌ Profile creation check failed:', error.message);
    return false;
  }
}

async function testSignIn() {
  console.log('\n🔐 Testing user sign in...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (error) throw error;

    testSession = data.session;
    console.log('✅ Sign in successful');
    return true;
  } catch (error) {
    console.error('❌ Sign in failed:', error.message);
    return false;
  }
}

async function testDataOperations() {
  console.log('\n💾 Testing data operations...');
  
  try {
    // Test creating a plan
    const { data: planData, error: planError } = await supabase
      .from('plans')
      .insert({
        user_id: testUserId,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lessons_goal: 5,
        minutes_goal: 100,
        status: 'active',
      })
      .select()
      .single();

    if (planError) throw planError;
    
    console.log('✅ Plan created');
    console.log(`   Plan ID: ${planData.id}`);

    // Test reading the plan
    const { data: readPlan, error: readError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planData.id)
      .single();

    if (readError) throw readError;
    console.log('✅ Plan read successful');

    // Test updating the plan
    const { data: updatedPlan, error: updateError } = await supabase
      .from('plans')
      .update({ status: 'completed' })
      .eq('id', planData.id)
      .select()
      .single();

    if (updateError) throw updateError;
    console.log('✅ Plan update successful');

    // Test deleting the plan
    const { error: deleteError } = await supabase
      .from('plans')
      .delete()
      .eq('id', planData.id);

    if (deleteError) throw deleteError;
    console.log('✅ Plan delete successful');

    return true;
  } catch (error) {
    console.error('❌ Data operations failed:', error.message);
    return false;
  }
}

async function testStorageBucket() {
  console.log('\n🗄️  Testing storage bucket access...');
  
  try {
    // Test if bucket exists and is accessible
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) throw bucketsError;
    
    const lessonAudioBucket = buckets.find(b => b.id === 'lesson-audio');
    
    if (!lessonAudioBucket) {
      console.error('❌ lesson-audio bucket not found');
      console.error('   Please run the storage setup script first');
      return false;
    }
    
    console.log('✅ Storage bucket exists');
    console.log(`   Bucket: ${lessonAudioBucket.name}`);
    console.log(`   Public: ${lessonAudioBucket.public}`);

    // Test file upload (small test file)
    const testFileName = `${testUserId}/test-${Date.now()}.txt`;
    const testContent = 'This is a test file';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lesson-audio')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
      });

    if (uploadError) {
      console.error('⚠️  File upload test failed:', uploadError.message);
      console.error('   This might be expected if storage policies are not set up');
      return false;
    }

    console.log('✅ File upload successful');

    // Test file deletion
    const { error: deleteError } = await supabase.storage
      .from('lesson-audio')
      .remove([testFileName]);

    if (deleteError) {
      console.error('⚠️  File deletion failed:', deleteError.message);
      return false;
    }

    console.log('✅ File deletion successful');
    return true;
  } catch (error) {
    console.error('❌ Storage bucket test failed:', error.message);
    return false;
  }
}

async function testSignOut() {
  console.log('\n🚪 Testing user sign out...');
  
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    console.log('✅ Sign out successful');
    return true;
  } catch (error) {
    console.error('❌ Sign out failed:', error.message);
    return false;
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  if (testUserId) {
    try {
      // Delete test user (this will cascade delete profile and other data)
      const { error } = await supabase.auth.admin.deleteUser(testUserId);
      if (error && error.message !== 'User not found') {
        console.error('⚠️  Cleanup warning:', error.message);
      } else {
        console.log('✅ Test user deleted');
      }
    } catch (error) {
      console.error('⚠️  Cleanup warning:', error.message);
      console.log('   You may need to manually delete the test user from Supabase Dashboard');
    }
  }
}

async function main() {
  console.log('🧪 Starting Supabase tests...\n');
  
  const results = {
    connection: false,
    signUp: false,
    profile: false,
    signIn: false,
    dataOps: false,
    storage: false,
    signOut: false,
  };

  try {
    results.connection = await testConnection();
    if (!results.connection) {
      console.error('\n❌ Cannot proceed without database connection');
      process.exit(1);
    }

    results.signUp = await testSignUp();
    if (results.signUp) {
      results.profile = await testProfileCreation();
    }

    results.signIn = await testSignIn();
    if (results.signIn) {
      results.dataOps = await testDataOperations();
      results.storage = await testStorageBucket();
    }

    results.signOut = await testSignOut();

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary:');
    console.log('='.repeat(50));
    console.log(`Database Connection: ${results.connection ? '✅' : '❌'}`);
    console.log(`Sign Up: ${results.signUp ? '✅' : '❌'}`);
    console.log(`Profile Creation: ${results.profile ? '✅' : '❌'}`);
    console.log(`Sign In: ${results.signIn ? '✅' : '❌'}`);
    console.log(`Data Operations: ${results.dataOps ? '✅' : '❌'}`);
    console.log(`Storage Bucket: ${results.storage ? '✅' : '❌'}`);
    console.log(`Sign Out: ${results.signOut ? '✅' : '❌'}`);
    console.log('='.repeat(50));

    const allPassed = Object.values(results).every(r => r);
    
    if (allPassed) {
      console.log('\n✅ All tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }

    await cleanup();
    
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    await cleanup();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testConnection, testSignUp, testSignIn, testDataOperations };

