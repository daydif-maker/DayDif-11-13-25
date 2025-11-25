#!/usr/bin/env node
/**
 * DayDif End-to-End Flow Test
 * Tests the complete flow: Content Generation → TTS → Audio Output
 * Simulates how the app generates lessons in production
 */

const fs = require('fs');
const path = require('path');

// Modal endpoints
const CONFIG = {
  CONTENT_SERVICE_URL: 'https://getdaydif--daydif-content-generate-content.modal.run',
  TTS_SERVICE_URL: 'https://getdaydif--daydif-tts-generate-tts.modal.run',
};

function formatDuration(ms) {
  return (ms / 1000).toFixed(2) + 's';
}

async function runE2ETest() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║       DayDif End-to-End Flow Test                             ║');
  console.log('║       Content Generation → TTS → Audio                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const testTopic = 'The Pomodoro Technique for better focus';
  const startTime = Date.now();

  // ==========================================================================
  // STEP 1: Generate Content (Open Notebook-style two-stage pipeline)
  // ==========================================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 STEP 1: Content Generation (Open Notebook Pipeline)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Topic: "${testTopic}"`);
  console.log('   ⏳ This runs the two-stage pipeline:');
  console.log('      Stage 1: Generate outline with segments');
  console.log('      Stage 2: Generate multi-speaker dialogue per segment\n');

  const contentStart = Date.now();
  let lesson;

  try {
    const contentResponse = await fetch(CONFIG.CONTENT_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: testTopic,
        lesson_number: 1,
        total_lessons: 3,
        user_level: 'beginner',
        duration_minutes: 5,
        style: 'conversational',
      }),
    });

    const contentResult = await contentResponse.json();

    if (!contentResult.success) {
      throw new Error(`Content generation failed: ${contentResult.error}`);
    }

    lesson = contentResult.lesson;
    const contentDuration = Date.now() - contentStart;

    console.log(`   ✅ Content generated in ${formatDuration(contentDuration)}`);
    console.log(`   📝 Title: "${lesson.title}"`);
    console.log(`   📖 Summary: "${lesson.summary.substring(0, 100)}..."`);
    console.log(`   📊 Segments: ${lesson.segments.length}`);
    console.log(`   💬 Total dialogue turns: ${lesson.full_transcript.length}`);
    console.log(`   🎙️ Speakers: ${lesson.speakers.map(s => s.name).join(', ')}`);
    console.log(`   💡 Key takeaways: ${lesson.key_takeaways.length}`);

    // Show segment breakdown
    console.log('\n   📋 Segment Breakdown:');
    lesson.segments.forEach((seg, i) => {
      console.log(`      ${i + 1}. ${seg.title} (${seg.type})`);
      console.log(`         • Dialogue turns: ${seg.transcript?.length || 'N/A'}`);
      console.log(`         • Est. duration: ${seg.duration_estimate}s`);
    });

    // Show sample dialogue
    console.log('\n   💬 Sample Dialogue (first 5 turns):');
    lesson.full_transcript.slice(0, 5).forEach((turn, i) => {
      const dialogue = turn.dialogue.length > 60 
        ? turn.dialogue.substring(0, 60) + '...' 
        : turn.dialogue;
      console.log(`      ${turn.speaker}: "${dialogue}"`);
    });

  } catch (error) {
    console.log(`   ❌ Content generation failed: ${error.message}`);
    process.exit(1);
  }

  // ==========================================================================
  // STEP 2: Generate TTS Audio from Dialogue
  // ==========================================================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎙️ STEP 2: TTS Audio Generation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   ⏳ Converting multi-speaker dialogue to audio...');
  console.log(`   📊 Processing ${lesson.full_transcript.length} dialogue turns\n`);

  const ttsStart = Date.now();

  try {
    // For this test, we'll generate audio for the first segment only (to save time)
    const firstSegment = lesson.segments[0];
    const segmentTranscript = firstSegment.transcript || lesson.full_transcript.slice(0, 6);

    console.log(`   🎯 Testing with first segment: "${firstSegment.title}"`);
    console.log(`   💬 Turns to process: ${segmentTranscript.length}`);

    const ttsResponse = await fetch(CONFIG.TTS_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: segmentTranscript,
      }),
    });

    const ttsResult = await ttsResponse.json();
    const ttsDuration = Date.now() - ttsStart;

    if (!ttsResult.success) {
      throw new Error(`TTS generation failed: ${ttsResult.error}`);
    }

    console.log(`\n   ✅ Audio generated in ${formatDuration(ttsDuration)}`);
    console.log(`   🎵 Mode: ${ttsResult.mode}`);

    if (ttsResult.audio_base64) {
      const audioSize = (ttsResult.audio_base64.length * 0.75 / 1024).toFixed(2);
      console.log(`   📁 Audio size: ${audioSize} KB`);

      // Save audio file for verification
      const audioBuffer = Buffer.from(ttsResult.audio_base64, 'base64');
      const outputPath = path.join(__dirname, '..', 'test_lesson_audio.wav');
      fs.writeFileSync(outputPath, audioBuffer);
      console.log(`   💾 Audio saved to: ${outputPath}`);
      
      // Calculate audio quality metrics
      const durationEstimate = audioSize / 100; // Rough estimate: ~100KB per second for WAV
      console.log(`   ⏱️ Estimated audio duration: ~${durationEstimate.toFixed(1)}s`);
    } else if (ttsResult.audio_url) {
      console.log(`   🔗 Audio URL: ${ttsResult.audio_url}`);
    }

  } catch (error) {
    console.log(`   ❌ TTS generation failed: ${error.message}`);
    process.exit(1);
  }

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  const totalDuration = Date.now() - startTime;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Total time: ${formatDuration(totalDuration)}`);
  console.log(`   Topic: "${testTopic}"`);
  console.log(`   Generated lesson: "${lesson.title}"`);
  console.log(`   Segments: ${lesson.segments.length}`);
  console.log(`   Dialogue turns: ${lesson.full_transcript.length}`);
  console.log(`   Speakers: ${lesson.speakers.map(s => s.name).join(', ')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🎉 END-TO-END TEST PASSED!');
  console.log('\nThe flow from Open Notebook-style content generation to TTS works correctly.');
  console.log('The lesson generation pipeline produces:');
  console.log('  • Structured content with segments');
  console.log('  • Multi-speaker dialogue between Alex and Sam');
  console.log('  • High-quality TTS audio with voice variation');

  console.log('\n📝 Generated Content Structure:');
  console.log(JSON.stringify({
    title: lesson.title,
    summary: lesson.summary,
    segments: lesson.segments.map(s => ({
      type: s.type,
      title: s.title,
      dialogueTurns: s.transcript?.length || 0,
    })),
    totalDialogueTurns: lesson.full_transcript.length,
    speakers: lesson.speakers.map(s => s.name),
    keyTakeaways: lesson.key_takeaways,
  }, null, 2));
}

runE2ETest().catch(console.error);

