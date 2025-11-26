// supabase/functions/generate-lesson/index.ts
/**
 * DayDif Lesson Generation Edge Function
 * Orchestrates content generation and TTS conversion
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-auth-bypass",
};

// Modal endpoints (set via secrets)
const CONTENT_SERVICE_URL = Deno.env.get("CONTENT_SERVICE_URL") || "";
const TTS_SERVICE_URL = Deno.env.get("TTS_SERVICE_URL") || "";

// Auth bypass configuration - set via environment variable
// When enabled, allows requests without authentication tokens
const AUTH_BYPASS_ENABLED = Deno.env.get("AUTH_BYPASS_ENABLED") === "true";

interface GenerateLessonRequest {
  planId: string;
  lessonId: string;
  topic: string;
  lessonNumber: number;
  totalLessons: number;
  userLevel: string;
  durationMinutes: number;
  sourceUrls?: string[];
  userId: string;
}

interface DialogueTurn {
  speaker: string;
  dialogue: string;
}

interface Segment {
  type: string;
  title: string;
  text: string;
  transcript?: DialogueTurn[];
  duration_estimate: number;
}

interface LessonContent {
  title: string;
  summary: string;
  script: string;
  segments: Segment[];
  full_transcript?: DialogueTurn[];
  key_takeaways: string[];
  speakers?: Array<{ name: string; voice_id?: string }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check for auth bypass header or environment variable
    const authBypassHeader = req.headers.get("x-auth-bypass") === "true";
    const isAuthBypassed = AUTH_BYPASS_ENABLED || authBypassHeader;
    
    if (isAuthBypassed) {
      console.log("🔓 Auth bypass enabled - allowing unauthenticated request");
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      planId,
      lessonId,
      topic,
      lessonNumber,
      totalLessons,
      userLevel,
      durationMinutes,
      sourceUrls,
      userId,
    }: GenerateLessonRequest = await req.json();

    console.log(
      `🚀 Generating lesson ${lessonNumber}/${totalLessons}: ${topic}`,
      { authBypassed: isAuthBypassed, userId }
    );

    // Validate required fields
    if (!lessonId || !topic || !userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: lessonId, topic, userId",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 1: Create AI job record for tracking
    const { data: job, error: jobError } = await supabase
      .from("ai_jobs")
      .insert({
        user_id: userId,
        plan_id: planId,
        lesson_id: lessonId,
        type: "lesson_content",
        status: "processing",
        input: {
          topic,
          lessonNumber,
          totalLessons,
          userLevel,
          durationMinutes,
          sourceUrls,
        },
      })
      .select()
      .single();

    if (jobError) {
      console.error("Failed to create job:", jobError);
      throw new Error(`Failed to create AI job: ${jobError.message}`);
    }

    // Step 2: Generate content via Modal
    console.log("📝 Calling content generation service...");

    if (!CONTENT_SERVICE_URL) {
      throw new Error("CONTENT_SERVICE_URL not configured");
    }

    const contentResponse = await fetch(CONTENT_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        lesson_number: lessonNumber,
        total_lessons: totalLessons,
        user_level: userLevel,
        duration_minutes: durationMinutes,
        source_urls: sourceUrls || [],
        style: "conversational",
      }),
    });

    const contentResult = await contentResponse.json();

    if (!contentResult.success) {
      throw new Error(`Content generation failed: ${contentResult.error}`);
    }

    const lesson: LessonContent = contentResult.lesson;
    console.log(`✅ Content generated: "${lesson.title}"`);

    // Step 3: Update lesson record with generated content
    const { error: updateError } = await supabase
      .from("plan_lessons")
      .update({
        title: lesson.title,
        description: lesson.summary,
        ai_prompt_used: topic,
        status: "in_progress",
      })
      .eq("id", lessonId);

    if (updateError) {
      console.error("Failed to update lesson:", updateError);
    }

    // Step 4: Create episodes and generate audio for each segment
    console.log(
      `🎙️ Generating audio for ${lesson.segments.length} segments...`
    );

    if (!TTS_SERVICE_URL) {
      throw new Error("TTS_SERVICE_URL not configured");
    }

    const episodes = [];
    for (let i = 0; i < lesson.segments.length; i++) {
      const segment = lesson.segments[i];
      console.log(
        `  Processing segment ${i + 1}/${lesson.segments.length}: ${segment.title}`
      );

      // Create episode record with transcript data in meta
      const episodeMeta: Record<string, unknown> = {
        generated_at: new Date().toISOString(),
      };

      // Store transcript in meta for playback UI
      if (segment.transcript && segment.transcript.length > 0) {
        episodeMeta.transcript = segment.transcript;
        episodeMeta.has_dialogue = true;
        episodeMeta.speaker_count = new Set(segment.transcript.map(t => t.speaker)).size;
      }

      const { data: episode, error: episodeError } = await supabase
        .from("episodes")
        .insert({
          lesson_id: lessonId,
          user_id: userId,
          type: segment.type,
          title: segment.title || `Part ${i + 1}`,
          body: segment.text,
          order_index: i,
          duration_seconds: segment.duration_estimate,
          meta: episodeMeta,
        })
        .select()
        .single();

      if (episodeError) {
        console.error(`Failed to create episode ${i}:`, episodeError);
        continue;
      }

      // Generate TTS audio
      // Use multi-speaker transcript mode if available, otherwise fall back to simple text
      try {
        const ttsRequestBody: Record<string, unknown> = {
          user_id: userId,
          episode_id: episode.id,
        };

        // Check if segment has multi-speaker transcript
        if (segment.transcript && Array.isArray(segment.transcript) && segment.transcript.length > 0) {
          // Use multi-speaker dialogue mode for richer audio
          console.log(`  Using multi-speaker TTS (${segment.transcript.length} dialogue turns)`);
          ttsRequestBody.transcript = segment.transcript;
        } else {
          // Fall back to simple text mode
          console.log(`  Using simple text TTS`);
          ttsRequestBody.text = segment.text;
          ttsRequestBody.speaker = "p225"; // Default voice
        }

        const ttsResponse = await fetch(TTS_SERVICE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ttsRequestBody),
        });

        const ttsResult = await ttsResponse.json();

        if (ttsResult.success && ttsResult.audio_url) {
          // Note: Modal TTS service now updates the episode directly in the database
          // This is a fallback update in case Modal's update failed
          const { error: audioUpdateError } = await supabase
            .from("episodes")
            .update({
              audio_path: ttsResult.audio_url,
            })
            .eq("id", episode.id);
          
          if (audioUpdateError) {
            // This might fail if Modal already updated it - that's OK
            console.log(`  ℹ️ Episode update result: ${audioUpdateError.message || 'already updated by Modal'}`);
          }

          episodes.push({
            ...episode,
            audio_path: ttsResult.audio_url,
          });
          console.log(`  ✅ Audio generated for segment ${i + 1} (mode: ${ttsResult.mode || 'unknown'})`);
        } else {
          console.error(
            `  ❌ TTS failed for segment ${i + 1}:`,
            ttsResult.error
          );
          episodes.push(episode);
        }
      } catch (ttsError) {
        console.error(`  ❌ TTS error for segment ${i + 1}:`, ttsError);
        episodes.push(episode);
      }
    }

    // Step 5: Mark lesson as completed
    // Note: Modal TTS service may have already marked the lesson as completed
    // This is a fallback to ensure completion even if Modal's update didn't happen
    const { error: lessonUpdateError } = await supabase
      .from("plan_lessons")
      .update({
        status: "completed",
        tags: lesson.key_takeaways || [],
      })
      .eq("id", lessonId);
    
    if (lessonUpdateError) {
      console.log(`  ℹ️ Lesson update note: ${lessonUpdateError.message || 'may already be completed'}`);
    }

    // Step 6: Mark AI job as completed
    await supabase
      .from("ai_jobs")
      .update({
        status: "completed",
        output: {
          lesson,
          episodeCount: episodes.length,
        },
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    console.log(`🎉 Lesson generation complete: ${lesson.title}`);

    return new Response(
      JSON.stringify({
        success: true,
        lessonId,
        title: lesson.title,
        summary: lesson.summary,
        episodeCount: episodes.length,
        keyTakeaways: lesson.key_takeaways,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error generating lesson:", error);

    // Try to mark the lesson as failed/skipped for retry capability
    try {
      const requestBody = await req.clone().json().catch(() => ({}));
      const { lessonId, userId, planId } = requestBody;

      if (lessonId) {
        const supabaseForError = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Mark lesson as skipped (failed)
        await supabaseForError
          .from("plan_lessons")
          .update({
            status: "skipped",
            description: `Generation failed: ${(error as Error).message}`,
          })
          .eq("id", lessonId);

        // Mark AI job as failed if we have a userId
        if (userId) {
          await supabaseForError
            .from("ai_jobs")
            .update({
              status: "failed",
              error: (error as Error).message,
            })
            .eq("lesson_id", lessonId)
            .eq("user_id", userId);
        }

        console.log(`Marked lesson ${lessonId} as failed for retry`);
      }
    } catch (markError) {
      console.error("Failed to mark lesson as failed:", markError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
        retryable: true,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

