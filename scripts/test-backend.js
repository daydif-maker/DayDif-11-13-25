#!/usr/bin/env node
/**
 * DayDif Backend Test Script (v3.0 - Open Notebook Edition)
 * Tests Modal services with Open Notebook prompts
 * 
 * Features tested:
 * - Open Notebook content generation (outline.jinja → transcript.jinja)
 * - Episode Profiles with Chatterbox voice mapping
 * - Multi-speaker dialogue generation
 * - Multi-speaker TTS with voice profiles
 * 
 * Usage: node scripts/test-backend.js
 * 
 * Before running, update the URLs below with your actual endpoints
 * 
 * Based on: https://github.com/lfnovo/open-notebook
 */

// ============================================================================
// CONFIGURATION - Update these with your actual URLs
// ============================================================================
const CONFIG = {
  // NEW: Open Notebook Edition Content Service (from `modal deploy open_notebook_service.py`)
  CONTENT_SERVICE_URL: 'https://getdaydif--daydif-content-generate-content.modal.run',
  
  // TTS Service (from `modal deploy tts_service.py`)
  TTS_SERVICE_URL: 'https://getdaydif--daydif-tts-generate-tts.modal.run',
  
  // Your Supabase Edge Function (from your project)
  EDGE_FUNCTION_URL: 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-lesson',
  
  // Optional: Supabase anon key for authenticated tests
  SUPABASE_ANON_KEY: 'your-anon-key-here',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDuration(ms) {
  return (ms / 1000).toFixed(2) + 's';
}

function truncate(str, len = 60) {
  return str.length > len ? str.substring(0, len) + '...' : str;
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testContentHealth() {
  console.log('\n1️⃣  Testing Content Health Endpoint...');
  
  const healthUrl = CONFIG.CONTENT_SERVICE_URL.replace('generate-content', 'health');
  console.log(`   URL: ${healthUrl}`);
  
  try {
    const response = await fetch(healthUrl);
    const result = await response.json();
    
    if (result.status === 'healthy') {
      console.log(`   ✅ Service healthy (v${result.version || '1.0'})`);
      if (result.features) {
        console.log(`   📦 Features: ${result.features.join(', ')}`);
      }
      return true;
    } else {
      console.log(`   ⚠️  Status: ${result.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ⚠️  Health check failed: ${error.message}`);
    return false;
  }
}

async function testEpisodeProfile() {
  console.log('\n2️⃣  Testing Episode Profile Endpoint...');
  
  const profileUrl = CONFIG.CONTENT_SERVICE_URL.replace('generate-content', 'get-episode-profile');
  console.log(`   URL: ${profileUrl}`);
  
  try {
    const response = await fetch(profileUrl);
    const result = await response.json();
    
    if (result.profile) {
      console.log(`   ✅ Episode profile retrieved`);
      console.log(`   🎭 Speakers:`);
      result.profile.speakers?.forEach(s => {
        console.log(`      - ${s.name}: ${truncate(s.backstory, 50)}`);
      });
      return { success: true, profile: result.profile };
    } else {
      console.log(`   ⚠️  No profile returned`);
      return { success: false };
    }
  } catch (error) {
    console.log(`   ⚠️  Profile check failed: ${error.message}`);
    return { success: false };
  }
}

async function testFullContentGeneration() {
  console.log('\n3️⃣  Testing Full Content Generation (Stage 1 + 2)...');
  console.log(`   URL: ${CONFIG.CONTENT_SERVICE_URL}`);
  console.log('   ⏳ This may take 1-2 minutes for full pipeline...');
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(CONFIG.CONTENT_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'The basics of time management',
        lesson_number: 1,
        total_lessons: 3,
        user_level: 'beginner',
        duration_minutes: 5,
        style: 'conversational',
      }),
    });

    const duration = Date.now() - startTime;
    const result = await response.json();
    
    if (result.success && result.lesson) {
      const lesson = result.lesson;
      console.log(`   ✅ SUCCESS (${formatDuration(duration)})`);
      console.log(`   📝 Title: "${lesson.title}"`);
      console.log(`   📊 Segments: ${lesson.segments?.length || 0}`);
      console.log(`   💬 Total dialogue turns: ${lesson.full_transcript?.length || 0}`);
      console.log(`   💡 Key takeaways: ${lesson.key_takeaways?.length || 0}`);
      
      // Show speakers
      if (lesson.speakers) {
        console.log(`   🎙️ Speakers: ${lesson.speakers.map(s => s.name).join(', ')}`);
      }
      
      // Show sample dialogue
      if (lesson.full_transcript && lesson.full_transcript.length > 0) {
        console.log('\n   📜 Sample dialogue:');
        lesson.full_transcript.slice(0, 4).forEach(turn => {
          console.log(`      ${turn.speaker}: "${truncate(turn.dialogue, 50)}"`);
        });
      }
      
      return { success: true, lesson };
    } else {
      console.log(`   ❌ FAILED: ${result.error}`);
      return { success: false };
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return { success: false };
  }
}

async function testTTSHealth() {
  console.log('\n4️⃣  Testing TTS Health Endpoint...');
  
  const healthUrl = CONFIG.TTS_SERVICE_URL.replace('generate-tts', 'health');
  console.log(`   URL: ${healthUrl}`);
  
  try {
    const response = await fetch(healthUrl);
    const result = await response.json();
    
    if (result.status === 'healthy') {
      console.log(`   ✅ Service healthy (v${result.version || '1.0'})`);
      if (result.features) {
        console.log(`   📦 Features: ${result.features.join(', ')}`);
      }
      if (result.voice_profiles) {
        console.log(`   🎙️ Voice profiles: ${result.voice_profiles.join(', ')}`);
      }
      return true;
    } else {
      console.log(`   ⚠️  Status: ${result.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ⚠️  Health check failed: ${error.message}`);
    return false;
  }
}

async function testSimpleTTS() {
  console.log('\n5️⃣  Testing Simple TTS Generation...');
  console.log(`   URL: ${CONFIG.TTS_SERVICE_URL}`);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(CONFIG.TTS_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello! This is a test of the DayDif text to speech system. Welcome to your personalized learning experience.',
        speaker: 'Sam',  // Use voice profile
      }),
    });

    const duration = Date.now() - startTime;
    const result = await response.json();
    
    if (result.success) {
      console.log(`   ✅ SUCCESS (${formatDuration(duration)})`);
      console.log(`   🎵 Mode: ${result.mode || 'simple'}`);
      if (result.audio_base64) {
        const audioSize = (result.audio_base64.length * 0.75 / 1024).toFixed(2);
        console.log(`   📁 Audio size: ${audioSize} KB`);
      } else if (result.audio_url) {
        console.log(`   🔗 Audio URL: ${truncate(result.audio_url)}`);
      }
      return true;
    } else {
      console.log(`   ❌ FAILED: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testMultiSpeakerTTS() {
  console.log('\n6️⃣  Testing Multi-Speaker Dialogue TTS...');
  console.log(`   URL: ${CONFIG.TTS_SERVICE_URL}`);
  
  const sampleTranscript = [
    { speaker: 'Sam', dialogue: 'Welcome to todays lesson on time management.' },
    { speaker: 'Alex', dialogue: 'Oh, this is something I really need help with!' },
    { speaker: 'Sam', dialogue: 'Dont worry, by the end of this lesson, youll have practical strategies you can use right away.' },
    { speaker: 'Alex', dialogue: 'That sounds great! Where do we start?' },
  ];
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(CONFIG.TTS_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: sampleTranscript,
      }),
    });

    const duration = Date.now() - startTime;
    const result = await response.json();
    
    if (result.success) {
      console.log(`   ✅ SUCCESS (${formatDuration(duration)})`);
      console.log(`   🎵 Mode: ${result.mode || 'dialogue'}`);
      console.log(`   💬 Turns processed: ${sampleTranscript.length}`);
      if (result.audio_base64) {
        const audioSize = (result.audio_base64.length * 0.75 / 1024).toFixed(2);
        console.log(`   📁 Combined audio size: ${audioSize} KB`);
      }
      return true;
    } else {
      console.log(`   ❌ FAILED: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testVoicesList() {
  console.log('\n7️⃣  Testing Voice Profiles List...');
  
  const voicesUrl = CONFIG.TTS_SERVICE_URL.replace('generate-tts', 'list-voices');
  console.log(`   URL: ${voicesUrl}`);
  
  try {
    const response = await fetch(voicesUrl);
    const result = await response.json();
    
    if (result.voices) {
      console.log(`   ✅ Voice profiles available:`);
      Object.entries(result.voices).forEach(([name, config]) => {
        console.log(`      • ${name}: ${config.description}`);
      });
      return true;
    } else {
      console.log(`   ⚠️  Could not fetch voice profiles`);
      return false;
    }
  } catch (error) {
    console.log(`   ⚠️  Voice list not available: ${error.message}`);
    return false;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║       DayDif Backend Test Suite v2.0                          ║');
  console.log('║       Open Notebook-Aligned Multi-Speaker Support             ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  
  // Check if URLs are configured
  if (CONFIG.CONTENT_SERVICE_URL.includes('YOUR_USERNAME')) {
    console.log('\n⚠️  WARNING: URLs not configured!');
    console.log('   Please update the CONFIG object at the top of this file');
    console.log('   with your actual Modal and Supabase URLs.\n');
    console.log('   After deploying Modal services, run:');
    console.log('   cd backend/modal && modal deploy content_service.py');
    console.log('   cd backend/modal && modal deploy tts_service.py\n');
    console.log('   Then update the URLs in this script.\n');
    process.exit(1);
  }

  const results = {
    contentHealth: false,
    episodeProfile: false,
    fullContentGen: false,
    ttsHealth: false,
    simpleTts: false,
    multiSpeakerTts: false,
  };

  // Run tests
  results.contentHealth = await testContentHealth();
  results.episodeProfile = (await testEpisodeProfile()).success;
  results.fullContentGen = (await testFullContentGeneration()).success;
  results.ttsHealth = await testTTSHealth();
  results.simpleTts = await testSimpleTTS();
  results.multiSpeakerTts = await testMultiSpeakerTTS();
  await testVoicesList();  // Info only, doesn't affect results

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                        TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   Content Service Health:     ${results.contentHealth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Episode Profile:            ${results.episodeProfile ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Full Content Generation:    ${results.fullContentGen ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   TTS Service Health:         ${results.ttsHealth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Simple TTS:                 ${results.simpleTts ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Multi-Speaker TTS:          ${results.multiSpeakerTts ? '✅ PASS' : '❌ FAIL'}`);
  console.log('═══════════════════════════════════════════════════════════════');

  const criticalPassed = results.fullContentGen && results.simpleTts;
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Your backend is fully operational.');
  } else if (criticalPassed) {
    console.log('\n✅ Critical tests passed. Some optional features may need attention.');
  } else {
    console.log('\n⚠️  Some critical tests failed. Check the errors above.');
  }

  console.log('\nNext steps:');
  console.log('1. Deploy Supabase Edge Function: supabase functions deploy generate-lesson');
  console.log('2. Set secrets: supabase secrets set CONTENT_SERVICE_URL=... TTS_SERVICE_URL=...');
  console.log('3. Test the full flow from your app');
  console.log('\nFor troubleshooting:');
  console.log('• Check Modal logs: modal app logs daydif-content');
  console.log('• Verify secrets: modal secret list');
  console.log('• Open Notebook reference: https://github.com/lfnovo/open-notebook');

  process.exit(allPassed ? 0 : (criticalPassed ? 0 : 1));
}

main().catch(console.error);
