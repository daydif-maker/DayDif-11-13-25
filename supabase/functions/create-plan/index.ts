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

interface CreatePlanRequest {
  topic: string;
  numberOfLessons: number;
  durationMinutes: number;
  userLevel: string;
  userId: string;
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

    const {
      topic,
      numberOfLessons,
      durationMinutes,
      userLevel,
      userId,
    }: CreatePlanRequest = await req.json();

    console.log(`📋 Creating plan for topic: ${topic}`, {
      numberOfLessons,
      durationMinutes,
      userLevel,
      userId,
      authBypassed: isAuthBypassed,
    });

    // Validate required fields
    if (!topic || !numberOfLessons || !userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: topic, numberOfLessons, userId",
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
    endDate.setDate(endDate.getDate() + numberOfLessons);

    const { data: plan, error: planError } = await supabase
      .from("plans")
      .insert({
        user_id: userId,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        lessons_goal: numberOfLessons,
        minutes_goal: numberOfLessons * durationMinutes,
        status: "active",
        source: "ai_generated",
        meta: {
          topic,
          lessonDuration: durationMinutes,
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
    for (let i = 0; i < numberOfLessons; i++) {
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
          totalLessons: numberOfLessons,
          userLevel,
          durationMinutes,
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
        lessons: createdLessons.map((l) => ({
          id: l.id,
          dayIndex: l.day_index,
          title: l.title,
        })),
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

