// supabase/functions/create-plan/index.ts
/**
 * DayDif Plan Creation Edge Function
 * Creates a plan with lesson placeholders and triggers lesson generation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-auth-bypass",
};

// Auth bypass configuration - allows requests without authentication tokens
const AUTH_BYPASS_ENABLED = Deno.env.get("AUTH_BYPASS_ENABLED") === "true";

// Anonymous user ID - must match the client-side ANONYMOUS_USER_ID
// Note: Cannot use nil UUID (all zeros) as Supabase Auth rejects it
const ANONYMOUS_USER_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

// ============================================================================
// Request/Validation Types (aligned with frontend src/types/lessonPlan.ts)
// ============================================================================

interface CreatePlanRequest {
  topic: string;
  numberOfLessons: number;
  durationMinutes: number;
  userLevel: string;
  userId: string;
  daysPerWeek?: number;
  lessonDuration?: string;
}

// Duration mapping: UI option string → numeric minutes (upper bound)
// MUST match LESSON_DURATION_MAP in src/types/lessonPlan.ts
const LESSON_DURATION_MAP: Record<string, number> = {
  '5': 5,
  '8-10': 10,   // Upper bound of 8-10 range
  '10-15': 15,  // Upper bound of 10-15 range
  '15-20': 20,  // Upper bound of 15-20 range
};

// Valid ranges for validation
const LESSON_COUNT_RANGE = { min: 1, max: 20 };
const DURATION_MINUTES_RANGE = { min: 5, max: 30 };

// ============================================================================
// Helper Functions
// ============================================================================

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) return parsed;
  }
  return null;
}

interface ResolutionResult<T> {
  value: T;
  source: 'primary' | 'fallback' | 'default';
  warning?: string;
}

/**
 * Resolve lesson count from request parameters
 * Priority: numberOfLessons (if valid) > computed from daysPerWeek > error
 */
function resolveLessonCount(
  numberOfLessons?: unknown,
  daysPerWeek?: unknown
): ResolutionResult<number> {
  // Try numberOfLessons first (should be the primary source from frontend)
  const numericLessons = toNumber(numberOfLessons);
  if (numericLessons !== null && numericLessons > 0) {
    const clamped = Math.min(Math.floor(numericLessons), LESSON_COUNT_RANGE.max);
    if (clamped !== numericLessons) {
      return {
        value: clamped,
        source: 'primary',
        warning: `numberOfLessons clamped from ${numericLessons} to ${clamped}`,
      };
    }
    return { value: clamped, source: 'primary' };
  }

  // Fallback: compute from daysPerWeek
  const numericDays = toNumber(daysPerWeek);
  if (numericDays !== null && numericDays > 0) {
    const lessonsFromDays = numericDays === 1 ? 1 : numericDays * 2;
    const clamped = Math.min(lessonsFromDays, LESSON_COUNT_RANGE.max);
    return {
      value: clamped,
      source: 'fallback',
      warning: `numberOfLessons was invalid (${numberOfLessons}), computed ${clamped} from daysPerWeek=${numericDays}`,
    };
  }

  // Both values invalid - this is an error condition
  return {
    value: LESSON_COUNT_RANGE.min,
    source: 'default',
    warning: `Both numberOfLessons (${numberOfLessons}) and daysPerWeek (${daysPerWeek}) were invalid. Using minimum of ${LESSON_COUNT_RANGE.min}.`,
  };
}

/**
 * Resolve duration minutes from request parameters
 * Priority: durationMinutes (if valid) > mapped from lessonDuration > error
 */
function resolveDurationMinutes(
  durationMinutes?: unknown,
  lessonDuration?: unknown
): ResolutionResult<number> {
  // Try durationMinutes first (should be the primary source from frontend)
  const numericDuration = toNumber(durationMinutes);
  if (numericDuration !== null && numericDuration > 0) {
    const clamped = Math.min(
      Math.max(Math.round(numericDuration), DURATION_MINUTES_RANGE.min),
      DURATION_MINUTES_RANGE.max
    );
    if (clamped !== numericDuration) {
      return {
        value: clamped,
        source: 'primary',
        warning: `durationMinutes clamped from ${numericDuration} to ${clamped}`,
      };
    }
    return { value: clamped, source: 'primary' };
  }

  // Fallback: look up from lessonDuration string
  const durationKey = typeof lessonDuration === "string" ? lessonDuration : undefined;
  if (durationKey && LESSON_DURATION_MAP[durationKey]) {
    return {
      value: LESSON_DURATION_MAP[durationKey],
      source: 'fallback',
      warning: `durationMinutes was invalid (${durationMinutes}), mapped ${LESSON_DURATION_MAP[durationKey]} from lessonDuration='${durationKey}'`,
    };
  }

  // Both values invalid - this is an error condition
  const defaultDuration = 10;
  return {
    value: defaultDuration,
    source: 'default',
    warning: `Both durationMinutes (${durationMinutes}) and lessonDuration (${lessonDuration}) were invalid. Using default of ${defaultDuration} minutes.`,
  };
}

/**
 * Ensures a user exists in auth.users for the given userId.
 * This is necessary for foreign key constraints when using auth bypass.
 */
async function ensureUserExists(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🔍 Checking if user ${userId} exists...`);
    
    // Check if user already exists
    const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError) {
      // getUserById returns an error if user doesn't exist - that's expected
      console.log(`User lookup result: ${getUserError.message}`);
    }
    
    if (existingUser?.user) {
      console.log(`✅ User ${userId} already exists`);
      return { success: true };
    }

    // User doesn't exist - create them (only for anonymous/bypass scenarios)
    console.log(`📝 Creating user ${userId} in auth.users...`);
    
    const email = userId === ANONYMOUS_USER_ID 
      ? "anonymous@daydif.local" 
      : `user-${userId.slice(0, 8)}@daydif.local`;
    
    console.log(`Creating user with email: ${email}`);
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      id: userId,
      email,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        is_anonymous: userId === ANONYMOUS_USER_ID,
        created_by: "edge_function",
      },
    });

    if (createError) {
      // Check if error is because user already exists (race condition)
      if (createError.message?.includes("already been registered") || 
          createError.message?.includes("already exists")) {
        console.log(`✅ User ${userId} already exists (race condition)`);
        return { success: true };
      }
      console.error(`❌ Failed to create user: ${createError.message}`);
      return { success: false, error: createError.message };
    }

    console.log(`✅ Created user ${newUser.user?.id}`);
    return { success: true };
  } catch (error) {
    const errorMessage = (error as Error).message || String(error);
    console.error(`❌ Error ensuring user exists: ${errorMessage}`);
    
    // If the error indicates the user already exists, treat as success
    if (errorMessage.includes("already") || errorMessage.includes("exists")) {
      console.log(`✅ User appears to exist (from error message)`);
      return { success: true };
    }
    
    return { success: false, error: errorMessage };
  }
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CreatePlanRequest = await req.json();
    const {
      topic,
      numberOfLessons,
      durationMinutes,
      userLevel,
      userId,
      daysPerWeek,
      lessonDuration,
    } = body;

    // Debug: Log raw input values before resolution
    console.log(`🔍 Raw input values:`, {
      numberOfLessons,
      numberOfLessonsType: typeof numberOfLessons,
      durationMinutes,
      durationMinutesType: typeof durationMinutes,
      daysPerWeek,
      lessonDuration,
    });

    // Resolve values with detailed tracking
    const lessonCountResult = resolveLessonCount(numberOfLessons, daysPerWeek);
    const durationResult = resolveDurationMinutes(durationMinutes, lessonDuration);

    const resolvedLessonCount = lessonCountResult.value;
    const resolvedDurationMinutes = durationResult.value;

    // Log any resolution warnings (indicates potential frontend issues)
    if (lessonCountResult.warning) {
      console.warn(`⚠️ Lesson count resolution: ${lessonCountResult.warning}`);
    }
    if (durationResult.warning) {
      console.warn(`⚠️ Duration resolution: ${durationResult.warning}`);
    }

    // If both values fell back to defaults, return an error instead of silently proceeding
    if (lessonCountResult.source === 'default' && durationResult.source === 'default') {
      console.error(`❌ Both numberOfLessons and durationMinutes were invalid`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid request: numberOfLessons (received: ${numberOfLessons}) and durationMinutes (received: ${durationMinutes}) must be valid positive numbers. Check frontend is sending correct values.`,
          debug: {
            receivedNumberOfLessons: numberOfLessons,
            receivedDurationMinutes: durationMinutes,
            receivedDaysPerWeek: daysPerWeek,
            receivedLessonDuration: lessonDuration,
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`📋 Creating plan for topic: ${topic}`, {
      rawNumberOfLessons: numberOfLessons,
      resolvedLessonCount,
      lessonCountSource: lessonCountResult.source,
      rawDurationMinutes: durationMinutes,
      resolvedDurationMinutes,
      durationSource: durationResult.source,
      userLevel,
      userId,
      daysPerWeek,
      lessonDuration,
      authBypassed: isAuthBypassed,
    });

    // Validate required fields
    if (!topic || !userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: topic and userId are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Additional validation for lesson count
    if (resolvedLessonCount < LESSON_COUNT_RANGE.min || resolvedLessonCount > LESSON_COUNT_RANGE.max) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `numberOfLessons must be between ${LESSON_COUNT_RANGE.min} and ${LESSON_COUNT_RANGE.max}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Additional validation for duration
    if (resolvedDurationMinutes < DURATION_MINUTES_RANGE.min || resolvedDurationMinutes > DURATION_MINUTES_RANGE.max) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `durationMinutes must be between ${DURATION_MINUTES_RANGE.min} and ${DURATION_MINUTES_RANGE.max}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Ensure user exists in auth.users (required for foreign key constraint)
    // This is especially important when using auth bypass with anonymous users
    if (isAuthBypassed) {
      const userResult = await ensureUserExists(supabase, userId);
      if (!userResult.success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to ensure user exists: ${userResult.error}`,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // 1. Create the plan
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + resolvedLessonCount);

    const { data: plan, error: planError } = await supabase
      .from("plans")
      .insert({
        user_id: userId,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        lessons_goal: resolvedLessonCount,
        minutes_goal: resolvedLessonCount * resolvedDurationMinutes,
        status: "active",
        source: "ai_generated",
        meta: {
          topic,
          lessonDuration: resolvedDurationMinutes,
          lessonDurationMinutes: resolvedDurationMinutes,
          lessonDurationRange: lessonDuration,
          lessonCount: resolvedLessonCount,
          daysPerWeek,
          userLevel,
        },
      })
      .select()
      .single();

    if (planError) {
      console.error("❌ Failed to create plan:", planError);
      throw new Error(`Failed to create plan: ${planError.message}`);
    }

    console.log(`✅ Plan created: ${plan.id}`);

    // 2. Create lesson placeholders
    const lessons = [];
    for (let i = 0; i < resolvedLessonCount; i++) {
      const lessonDate = new Date();
      lessonDate.setDate(lessonDate.getDate() + i);

      lessons.push({
        plan_id: plan.id,
        user_id: userId,
        day_index: i,
        date: lessonDate.toISOString().split("T")[0],
        title: `${topic} - Part ${i + 1}`,
        description: "Generating...",
        status: "pending",
        primary_topic: topic,
        meta: {
          duration_minutes: resolvedDurationMinutes,
          duration_range: lessonDuration,
        },
      });
    }

    const { data: createdLessons, error: lessonsError } = await supabase
      .from("plan_lessons")
      .insert(lessons)
      .select();

    if (lessonsError) {
      console.error("❌ Failed to create lessons:", lessonsError);
      throw new Error(`Failed to create lessons: ${lessonsError.message}`);
    }

    console.log(`✅ Created ${createdLessons.length} lesson placeholders`);

    // 3. Trigger generation for each lesson (fire and forget via edge function invocation)
    const generateLessonUrl = `${supabaseUrl}/functions/v1/generate-lesson`;
    
    for (const lesson of createdLessons) {
      // Fire and forget - don't await
      fetch(generateLessonUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "X-Auth-Bypass": "true",
        },
        body: JSON.stringify({
          planId: plan.id,
          lessonId: lesson.id,
          topic,
          lessonNumber: lesson.day_index + 1,
          totalLessons: resolvedLessonCount,
          userLevel,
          durationMinutes: resolvedDurationMinutes,
          userId,
        }),
      }).catch((err) => {
        console.error(`Failed to trigger lesson ${lesson.day_index + 1}:`, err);
      });
    }

    console.log(`🚀 Triggered generation for ${createdLessons.length} lessons`);

    return new Response(
      JSON.stringify({
        success: true,
        planId: plan.id,
        lessonCount: createdLessons.length,
        durationMinutes: resolvedDurationMinutes,
        lessons: createdLessons.map((l) => ({
          id: l.id,
          dayIndex: l.day_index,
          title: l.title,
        })),
        // Include resolution details for debugging (can be removed in production)
        _debug: {
          requestedLessons: numberOfLessons,
          resolvedLessons: resolvedLessonCount,
          lessonCountSource: lessonCountResult.source,
          requestedDuration: durationMinutes,
          resolvedDuration: resolvedDurationMinutes,
          durationSource: durationResult.source,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error creating plan:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
