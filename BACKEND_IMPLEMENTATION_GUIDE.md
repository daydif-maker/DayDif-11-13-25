# DayDif Backend Implementation Guide

**Version:** 1.0  
**Created:** November 2024  
**Status:** Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Prerequisites](#prerequisites)
4. [Phase 1: Supabase Production Setup](#phase-1-supabase-production-setup)
5. [Phase 2: Modal Account Setup](#phase-2-modal-account-setup)
6. [Phase 3: Deploy TTS Service](#phase-3-deploy-tts-service-chatterbox-on-modal)
7. [Phase 4: Deploy Content Generation Service](#phase-4-deploy-content-generation-service-open-notebook)
8. [Phase 5: Create Supabase Edge Functions](#phase-5-create-supabase-edge-functions)
9. [Phase 6: Update App Services](#phase-6-update-app-services)
10. [Phase 7: Testing](#phase-7-testing)
11. [Cost Summary](#cost-summary)
12. [Troubleshooting](#troubleshooting)

---

## Overview

### What We're Building

A backend system that allows users to:
1. **Input a lesson topic** (e.g., "Machine Learning basics")
2. **Choose number of lessons** (e.g., 5 lessons)
3. **Set lesson duration** (e.g., 20 minutes each)

The backend then:
1. Generates AI-powered lesson scripts using Open Notebook / OpenAI
2. Converts scripts to audio using Chatterbox TTS
3. Stores everything in Supabase for the app to consume

### Services Used

| Service | Purpose | Cost |
|---------|---------|------|
| **Supabase** | Database, Auth, Storage, Edge Functions | Free tier / $25/mo Pro |
| **Modal** | GPU compute for TTS + Content generation | Pay-per-use (~$0.15/lesson) |
| **OpenAI GPT-4** | AI content generation | Pay-per-use (~$0.13/lesson) |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INPUT (App)                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  Lesson Topic   │  │  # of Lessons   │  │ Lesson Duration │             │
│  │  "Machine       │  │      5          │  │    20 minutes   │             │
│  │   Learning"     │  │                 │  │                 │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
└───────────┼────────────────────┼────────────────────┼───────────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE (Hub)                                     │
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐      │
│  │   Auth   │  │ Database │  │ Storage  │  │    Edge Functions      │      │
│  │          │  │          │  │ (Audio)  │  │  /generate-lesson      │      │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┬────────────┘      │
│                                                        │                    │
└────────────────────────────────────────────────────────┼────────────────────┘
                                                         │
                         ┌───────────────────────────────┼───────────────────┐
                         │                               │                   │
                         ▼                               ▼                   │
          ┌──────────────────────────┐    ┌──────────────────────────┐       │
          │   MODAL: Content Gen     │    │   MODAL: TTS Service     │       │
          │                          │    │                          │       │
          │   • OpenAI GPT-4         │───▶│   • Chatterbox/Coqui TTS │       │
          │   • Script generation    │    │   • Audio synthesis      │       │
          │   • Source ingestion     │    │   • Multi-voice support  │       │
          │                          │    │                          │       │
          └──────────────────────────┘    └──────────────┬───────────┘       │
                                                         │                   │
                                                         ▼                   │
                                          ┌──────────────────────────┐       │
                                          │  Upload to Supabase      │───────┘
                                          │  Storage (lesson-audio)  │
                                          └──────────────────────────┘
```

---

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Python 3.10+ installed
- [ ] Git installed
- [ ] A Supabase account (https://supabase.com)
- [ ] A Modal account (https://modal.com)
- [ ] An OpenAI API key (https://platform.openai.com)

---

## Phase 1: Supabase Production Setup

**Estimated Time: 30 minutes**

### Step 1.1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Project name:** `daydif-production`
   - **Database password:** (generate and save securely!)
   - **Region:** Choose closest to your users
4. Wait for provisioning (~2 minutes)

### Step 1.2: Install Supabase CLI

```bash
# Install globally
npm install -g supabase

# Verify installation
supabase --version
```

### Step 1.3: Login and Link Project

```bash
# Login to Supabase
supabase login

# Navigate to project
cd /Users/georgeharb/ExpoDevelopment/DayDifv6

# Link to your project (get ref from Dashboard → Settings → General)
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 1.4: Push Database Migrations

```bash
# Push existing migrations
supabase db push
```

This runs:
- `000_enable_extensions.sql` - Enables pgcrypto
- `001_initial_schema.sql` - Creates all tables (plans, plan_lessons, episodes, ai_jobs, etc.)
- `002_storage_setup.sql` - Creates lesson-audio bucket

### Step 1.5: Get API Keys

1. Go to **Supabase Dashboard → Settings → API**
2. Copy and save:

| Key | Environment Variable | Where to Use |
|-----|---------------------|--------------|
| Project URL | `EXPO_PUBLIC_SUPABASE_URL` | App + Backend |
| anon public | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | App only |
| service_role | `SUPABASE_SERVICE_ROLE_KEY` | Backend only (keep secret!) |

### Step 1.6: Update Environment File

Create/update `.env` in project root:

```bash
# Supabase (for Expo app)
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Backend secrets (DO NOT COMMIT)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
OPENAI_API_KEY=sk-...
```

### Step 1.7: Verify Connection

```bash
npm start
# App should connect without Supabase warnings
```

**✅ Checkpoint:** Supabase project created, migrations applied, keys saved.

---

## Phase 2: Modal Account Setup

**Estimated Time: 15 minutes**

### Step 2.1: Create Modal Account

1. Go to https://modal.com/signup
2. Sign up with GitHub (recommended)
3. Verify your account

### Step 2.2: Install Modal CLI

```bash
# Install Modal
pip install modal

# Verify installation
modal --version
```

### Step 2.3: Authenticate

```bash
# This opens browser for authentication
modal token new
```

### Step 2.4: Create Secrets

```bash
# OpenAI secret (for content generation)
modal secret create openai-secret OPENAI_API_KEY=sk-your-key-here

# Supabase secret (for uploading audio)
modal secret create supabase-secret \
  SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Step 2.5: Verify Secrets

```bash
modal secret list
# Should show: openai-secret, supabase-secret
```

**✅ Checkpoint:** Modal account created, CLI authenticated, secrets configured.

---

## Phase 3: Deploy TTS Service (Chatterbox on Modal)

**Estimated Time: 30 minutes**

### Step 3.1: Create Backend Directory

```bash
mkdir -p backend/modal
cd backend/modal
```

### Step 3.2: Create TTS Service

Create `tts_service.py`:

```python
# backend/modal/tts_service.py
import modal
import io

app = modal.App("daydif-tts")

# Build container image with TTS dependencies
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("ffmpeg", "git")
    .pip_install(
        "torch",
        "torchaudio",
        "transformers",
        "soundfile",
        "scipy",
        "supabase",
        "TTS",  # Coqui TTS - high quality open source
    )
)


@app.cls(
    image=image,
    gpu="T4",
    timeout=600,
    secrets=[modal.Secret.from_name("supabase-secret")],
)
class TTSGenerator:
    """TTS Generator class that loads model once and reuses"""
    
    @modal.enter()
    def load_model(self):
        """Load TTS model when container starts"""
        from TTS.api import TTS
        # High-quality multi-speaker model
        self.tts = TTS(model_name="tts_models/en/vctk/vits", progress_bar=False)
        print("✅ TTS Model loaded")

    @modal.method()
    def generate_audio(
        self,
        text: str,
        speaker: str = "p225",
        output_format: str = "wav",
    ) -> bytes:
        """Generate audio bytes from text"""
        import soundfile as sf
        import io

        # Generate audio waveform
        wav = self.tts.tts(text=text, speaker=speaker)

        # Convert to bytes
        buffer = io.BytesIO()
        sf.write(buffer, wav, 22050, format="WAV")
        buffer.seek(0)

        return buffer.read()

    @modal.method()
    def generate_and_upload(
        self,
        text: str,
        user_id: str,
        episode_id: str,
        speaker: str = "p225",
    ) -> str:
        """Generate audio and upload to Supabase Storage"""
        import os
        from supabase import create_client

        # Generate audio
        audio_bytes = self.generate_audio(text, speaker)

        # Connect to Supabase
        supabase = create_client(
            os.environ["SUPABASE_URL"],
            os.environ["SUPABASE_SERVICE_ROLE_KEY"]
        )

        # Upload path: {user_id}/{episode_id}.wav
        file_path = f"{user_id}/{episode_id}.wav"

        # Upload to storage
        result = supabase.storage.from_("lesson-audio").upload(
            path=file_path,
            file=audio_bytes,
            file_options={"content-type": "audio/wav"}
        )

        # Get public URL
        url = supabase.storage.from_("lesson-audio").get_public_url(file_path)

        return url


# HTTP endpoint for direct calls
@app.function(image=image, gpu="T4", timeout=300, secrets=[modal.Secret.from_name("supabase-secret")])
@modal.web_endpoint(method="POST")
def generate_tts(request: dict) -> dict:
    """HTTP endpoint for TTS generation"""
    text = request.get("text", "")
    speaker = request.get("speaker", "p225")
    user_id = request.get("user_id")
    episode_id = request.get("episode_id")

    generator = TTSGenerator()

    if user_id and episode_id:
        # Generate and upload to Supabase
        url = generator.generate_and_upload.remote(text, user_id, episode_id, speaker)
        return {"success": True, "audio_url": url}
    else:
        # Just generate and return base64
        import base64
        audio_bytes = generator.generate_audio.remote(text, speaker)
        return {
            "success": True,
            "audio_base64": base64.b64encode(audio_bytes).decode()
        }
```

### Step 3.3: Deploy TTS Service

```bash
cd /Users/georgeharb/ExpoDevelopment/DayDifv6/backend/modal
modal deploy tts_service.py
```

**Output:**
```
✓ Created objects.
├── 🔨 Created TTSGenerator class
└── 🔨 Created generate_tts web endpoint
    └── https://YOUR_USERNAME--daydif-tts-generate-tts.modal.run
```

**Save this URL:** `TTS_SERVICE_URL`

### Step 3.4: Test TTS Service

```bash
curl -X POST https://YOUR_USERNAME--daydif-tts-generate-tts.modal.run \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello! Welcome to DayDif.", "speaker": "p225"}'
```

**✅ Checkpoint:** TTS service deployed and responding.

---

## Phase 4: Deploy Content Generation Service (Open Notebook Style)

**Estimated Time: 45 minutes**

This service is inspired by [Open Notebook](https://github.com/lfnovo/open-notebook), an open-source implementation of NotebookLM with podcast generation capabilities.

### Architecture Overview

Like Open Notebook, our content generation uses a **two-stage pipeline**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TWO-STAGE GENERATION PIPELINE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Stage 1: OUTLINE GENERATION                                         │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Input: Topic, duration, user level, source materials          │ │
│  │  Output: Structured outline with segments                       │ │
│  │  - Introduction segment                                         │ │
│  │  - 2-4 Content segments with key points                        │ │
│  │  - Summary/Conclusion segment                                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                       │
│                              ▼                                       │
│  Stage 2: TRANSCRIPT GENERATION (per segment)                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Input: Outline + segment details + speaker profiles           │ │
│  │  Output: Multi-speaker dialogue transcript                      │ │
│  │  - Natural conversation between Alex (learner) & Sam (expert)  │ │
│  │  - Engaging back-and-forth dialogue                            │ │
│  │  - Ready for TTS with voice differentiation                    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Features (Aligned with Open Notebook)

| Feature | Open Notebook | DayDif Implementation |
|---------|--------------|----------------------|
| Two-stage generation | ✅ outline.jinja → transcript.jinja | ✅ generate_outline → generate_segment_transcript |
| Multi-speaker dialogue | ✅ Configurable speakers | ✅ Alex (learner) + Sam (expert) |
| Jinja2 prompt templates | ✅ | ✅ |
| Segment-based structure | ✅ | ✅ |
| Source material ingestion | ✅ YouTube, web, PDF | ✅ YouTube, web |

### Step 4.1: Understand the Content Service Structure

The content service (`backend/modal/content_service.py`) contains:

```python
# Key components of content_service.py

# 1. Speaker Configuration
DEFAULT_SPEAKERS = [
    {
        "name": "Alex",
        "backstory": "A curious learner who asks great questions...",
        "personality": "Enthusiastic, curious, relatable...",
        "voice_id": "p225",
    },
    {
        "name": "Sam",
        "backstory": "An expert educator who explains concepts clearly...",
        "personality": "Knowledgeable, patient, warm...",
        "voice_id": "p226",
    },
]

# 2. Stage 1 - Outline Generation
@app.function(...)
def generate_outline(topic, lesson_number, total_lessons, ...) -> dict:
    """Generates structured outline with segments"""
    # Returns: {title, summary, segments: [{name, description, size, key_points}]}

# 3. Stage 2 - Transcript Generation (per segment)
@app.function(...)
def generate_segment_transcript(outline, segment_index, previous_transcript) -> dict:
    """Generates dialogue for a single segment"""
    # Returns: {segment_name, transcript: [{speaker, dialogue}], duration_estimate}

# 4. Combined Pipeline
@app.function(...)
def generate_lesson_content(topic, ...) -> dict:
    """Full pipeline: outline → transcripts for all segments"""
    # Returns complete lesson with multi-speaker dialogue
```

### Step 4.2: Review the Output Format

The content service produces output optimized for multi-speaker TTS:

```json
{
  "title": "Introduction to Machine Learning",
  "summary": "A beginner-friendly exploration of ML concepts...",
  "topic": "Machine Learning basics",
  "lesson_number": 1,
  "total_lessons": 5,
  "duration_minutes": 10,
  "script": "Full script as text...",
  "segments": [
    {
      "type": "intro",
      "title": "Welcome to Machine Learning",
      "text": "Combined segment text for simple TTS...",
      "transcript": [
        {"speaker": "Sam", "dialogue": "Hey everyone! Welcome to..."},
        {"speaker": "Alex", "dialogue": "I'm really excited about this..."},
        {"speaker": "Sam", "dialogue": "Today we're going to explore..."}
      ],
      "duration_estimate": 90,
      "key_points": ["What is ML?", "Why does it matter?"]
    },
    {
      "type": "content",
      "title": "What is Machine Learning?",
      "text": "...",
      "transcript": [...],
      "duration_estimate": 180,
      "key_points": ["Definition", "Real-world examples"]
    }
  ],
  "full_transcript": [
    {"speaker": "Sam", "dialogue": "..."},
    {"speaker": "Alex", "dialogue": "..."}
  ],
  "key_takeaways": ["ML learns from data", "No explicit programming needed", "..."],
  "speakers": [
    {"name": "Alex", "voice_id": "p225", ...},
    {"name": "Sam", "voice_id": "p226", ...}
  ]
}
```

### Step 4.3: Deploy Content Service

```bash
cd /Users/georgeharb/ExpoDevelopment/DayDifv6/backend/modal

# Deploy the service
modal deploy content_service.py
```

**Expected Output:**
```
✓ Created objects.
├── 🔨 Created generate_outline function
├── 🔨 Created generate_segment_transcript function
├── 🔨 Created generate_lesson_content function
├── 🔨 Created generate_content web endpoint
├── 🔨 Created generate_outline_only web endpoint
└── 🔨 Created health web endpoint
    ├── https://YOUR_USERNAME--daydif-content-generate-content.modal.run
    ├── https://YOUR_USERNAME--daydif-content-generate-outline-only.modal.run
    └── https://YOUR_USERNAME--daydif-content-health.modal.run
```

**Save these URLs:**
- `CONTENT_SERVICE_URL` - Main content generation endpoint
- `OUTLINE_PREVIEW_URL` - For generating outline previews only

### Step 4.4: Test Content Service

**Test 1: Health Check**
```bash
curl https://YOUR_USERNAME--daydif-content-health.modal.run
```

Expected:
```json
{
  "status": "healthy",
  "service": "daydif-content",
  "version": "2.0",
  "features": ["two-stage-generation", "multi-speaker-dialogue", "open-notebook-aligned"]
}
```

**Test 2: Generate Outline Only (Preview)**
```bash
curl -X POST https://YOUR_USERNAME--daydif-content-generate-outline-only.modal.run \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Introduction to Machine Learning",
    "lesson_number": 1,
    "total_lessons": 5,
    "user_level": "beginner",
    "duration_minutes": 10
  }'
```

**Test 3: Full Content Generation**
```bash
curl -X POST https://YOUR_USERNAME--daydif-content-generate-content.modal.run \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Introduction to Machine Learning",
    "lesson_number": 1,
    "total_lessons": 5,
    "user_level": "beginner",
    "duration_minutes": 10,
    "source_urls": ["https://en.wikipedia.org/wiki/Machine_learning"]
  }'
```

**Test 4: Custom Speakers**
```bash
curl -X POST https://YOUR_USERNAME--daydif-content-generate-content.modal.run \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "History of Jazz",
    "duration_minutes": 15,
    "speakers": [
      {
        "name": "Maya",
        "backstory": "A passionate jazz enthusiast and historian",
        "personality": "Animated, storytelling, nostalgic"
      },
      {
        "name": "Jordan",
        "backstory": "A curious newcomer to jazz",
        "personality": "Eager, questioning, discovering"
      }
    ]
  }'
```

### Step 4.5: Integration with TTS Service

The content service output is designed to work with the updated TTS service's multi-speaker support:

```python
# Example: Processing content for TTS

# Option 1: Simple mode (combined text per segment)
for segment in lesson["segments"]:
    tts_response = call_tts_service({
        "text": segment["text"],
        "user_id": user_id,
        "episode_id": f"{lesson_id}_segment_{i}"
    })

# Option 2: Multi-speaker mode (dialogue with voice variation)
for segment in lesson["segments"]:
    tts_response = call_tts_service({
        "transcript": segment["transcript"],  # [{speaker, dialogue}]
        "user_id": user_id,
        "episode_id": f"{lesson_id}_segment_{i}"
    })
```

### Comparison with Open Notebook

| Aspect | Open Notebook | DayDif |
|--------|--------------|--------|
| Template Format | Jinja2 files in `/prompts/` | Embedded Jinja2 in Python |
| Speaker Config | External config | Default speakers + API override |
| Segment Sizing | short/medium/long | short/medium/long |
| Extended Thinking | GPT-5 support with `<think>` tags | Standard GPT-4-turbo |
| Context Sources | YouTube, Web, PDF, PowerPoint | YouTube, Web |
| Output Format | JSON with transcript array | JSON with transcript + combined text |

**✅ Checkpoint:** Content service deployed with Open Notebook-aligned two-stage generation.

---

## Phase 5: Create Supabase Edge Functions

**Estimated Time: 30 minutes**

### Step 5.1: Initialize Edge Function

```bash
cd /Users/georgeharb/ExpoDevelopment/DayDifv6
supabase functions new generate-lesson
```

### Step 5.2: Create Edge Function Code

Edit `supabase/functions/generate-lesson/index.ts`:

```typescript
// supabase/functions/generate-lesson/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Modal endpoints (set via secrets)
const CONTENT_SERVICE_URL = Deno.env.get('CONTENT_SERVICE_URL') || '';
const TTS_SERVICE_URL = Deno.env.get('TTS_SERVICE_URL') || '';

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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

    console.log(`🚀 Generating lesson ${lessonNumber}/${totalLessons}: ${topic}`);

    // Step 1: Create AI job record for tracking
    const { data: job, error: jobError } = await supabase
      .from('ai_jobs')
      .insert({
        user_id: userId,
        plan_id: planId,
        lesson_id: lessonId,
        type: 'lesson_content',
        status: 'processing',
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
      console.error('Failed to create job:', jobError);
      throw new Error(`Failed to create AI job: ${jobError.message}`);
    }

    // Step 2: Generate content via Modal
    console.log('📝 Calling content generation service...');
    const contentResponse = await fetch(CONTENT_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        lesson_number: lessonNumber,
        total_lessons: totalLessons,
        user_level: userLevel,
        duration_minutes: durationMinutes,
        source_urls: sourceUrls || [],
        style: 'conversational',
      }),
    });

    const contentResult = await contentResponse.json();

    if (!contentResult.success) {
      throw new Error(`Content generation failed: ${contentResult.error}`);
    }

    const lesson = contentResult.lesson;
    console.log(`✅ Content generated: "${lesson.title}"`);

    // Step 3: Update lesson record with generated content
    await supabase
      .from('plan_lessons')
      .update({
        title: lesson.title,
        description: lesson.summary,
        ai_prompt_used: topic,
        status: 'in_progress',
      })
      .eq('id', lessonId);

    // Step 4: Create episodes and generate audio for each segment
    console.log(`🎙️ Generating audio for ${lesson.segments.length} segments...`);

    const episodes = [];
    for (let i = 0; i < lesson.segments.length; i++) {
      const segment = lesson.segments[i];
      console.log(`  Processing segment ${i + 1}/${lesson.segments.length}: ${segment.title}`);

      // Create episode record
      const { data: episode, error: episodeError } = await supabase
        .from('episodes')
        .insert({
          lesson_id: lessonId,
          user_id: userId,
          type: segment.type,
          title: segment.title || `Part ${i + 1}`,
          body: segment.text,
          order_index: i,
          duration_seconds: segment.duration_estimate,
          meta: {
            generated_at: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (episodeError) {
        console.error(`Failed to create episode ${i}:`, episodeError);
        continue;
      }

      // Generate TTS audio
      try {
        const ttsResponse = await fetch(TTS_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: segment.text,
            user_id: userId,
            episode_id: episode.id,
            speaker: 'p225', // Default voice
          }),
        });

        const ttsResult = await ttsResponse.json();

        if (ttsResult.success && ttsResult.audio_url) {
          // Update episode with audio path
          await supabase
            .from('episodes')
            .update({
              audio_path: ttsResult.audio_url,
            })
            .eq('id', episode.id);

          episodes.push({
            ...episode,
            audio_path: ttsResult.audio_url,
          });
          console.log(`  ✅ Audio generated for segment ${i + 1}`);
        } else {
          console.error(`  ❌ TTS failed for segment ${i + 1}:`, ttsResult.error);
        }
      } catch (ttsError) {
        console.error(`  ❌ TTS error for segment ${i + 1}:`, ttsError);
      }
    }

    // Step 5: Mark lesson as completed
    await supabase
      .from('plan_lessons')
      .update({
        status: 'completed',
        tags: lesson.key_takeaways || [],
      })
      .eq('id', lessonId);

    // Step 6: Mark AI job as completed
    await supabase
      .from('ai_jobs')
      .update({
        status: 'completed',
        output: {
          lesson,
          episodeCount: episodes.length,
        },
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error generating lesson:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

### Step 5.3: Set Edge Function Secrets

```bash
# Set your Modal endpoint URLs
supabase secrets set CONTENT_SERVICE_URL=https://YOUR_USERNAME--daydif-content-generate-content.modal.run
supabase secrets set TTS_SERVICE_URL=https://YOUR_USERNAME--daydif-tts-generate-tts.modal.run
```

### Step 5.4: Deploy Edge Function

```bash
supabase functions deploy generate-lesson
```

**Edge Function URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-lesson`

**✅ Checkpoint:** Edge function deployed and configured.

---

## Phase 6: Update App Services

**Estimated Time: 15 minutes**

### Step 6.1: Update TTS Service

Replace contents of `src/services/audio/ttsService.ts`:

```typescript
/**
 * TTS Service - Connects to DayDif Backend
 * Handles lesson generation and audio creation
 */

import { supabase } from '@lib/supabase/client';

export interface TTSConfig {
  voice?: string;
  speed?: number;
  pitch?: number;
  language?: string;
}

export interface LessonGenerationRequest {
  planId: string;
  lessonId: string;
  topic: string;
  lessonNumber: number;
  totalLessons: number;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  sourceUrls?: string[];
  userId: string;
}

export interface LessonGenerationResponse {
  success: boolean;
  lessonId?: string;
  title?: string;
  summary?: string;
  episodeCount?: number;
  keyTakeaways?: string[];
  error?: string;
}

export interface TTSService {
  generateLesson(request: LessonGenerationRequest): Promise<LessonGenerationResponse>;
  generatePlan(
    topic: string,
    numberOfLessons: number,
    durationMinutes: number,
    userLevel: string,
    userId: string
  ): Promise<{ success: boolean; planId?: string; error?: string }>;
  getJobStatus(jobId: string): Promise<{ status: string; progress: number }>;
  isAvailable(): boolean;
}

class TTSServiceImpl implements TTSService {
  private edgeFunctionUrl: string;

  constructor() {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    this.edgeFunctionUrl = `${supabaseUrl}/functions/v1`;
  }

  /**
   * Generate a complete learning plan with multiple lessons
   */
  async generatePlan(
    topic: string,
    numberOfLessons: number,
    durationMinutes: number,
    userLevel: string,
    userId: string
  ): Promise<{ success: boolean; planId?: string; error?: string }> {
    try {
      console.log('[TTSService] Creating plan:', { topic, numberOfLessons, durationMinutes });

      // 1. Create the plan record
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + numberOfLessons);

      const { data: plan, error: planError } = await supabase
        .from('plans')
        .insert({
          user_id: userId,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          lessons_goal: numberOfLessons,
          minutes_goal: numberOfLessons * durationMinutes,
          status: 'active',
          source: 'ai_generated',
          meta: {
            topic,
            lessonDuration: durationMinutes,
            userLevel,
          },
        })
        .select()
        .single();

      if (planError) {
        throw new Error(`Failed to create plan: ${planError.message}`);
      }

      // 2. Create lesson placeholders
      const lessons = [];
      for (let i = 0; i < numberOfLessons; i++) {
        const lessonDate = new Date();
        lessonDate.setDate(lessonDate.getDate() + i);

        lessons.push({
          plan_id: plan.id,
          user_id: userId,
          day_index: i,
          date: lessonDate.toISOString().split('T')[0],
          title: `${topic} - Part ${i + 1}`,
          description: 'Generating...',
          status: 'pending',
          primary_topic: topic,
        });
      }

      const { data: createdLessons, error: lessonsError } = await supabase
        .from('plan_lessons')
        .insert(lessons)
        .select();

      if (lessonsError) {
        throw new Error(`Failed to create lessons: ${lessonsError.message}`);
      }

      // 3. Trigger generation for each lesson (async)
      for (const lesson of createdLessons) {
        // Don't await - let them generate in parallel/sequence
        this.generateLesson({
          planId: plan.id,
          lessonId: lesson.id,
          topic,
          lessonNumber: lesson.day_index + 1,
          totalLessons: numberOfLessons,
          userLevel: userLevel as 'beginner' | 'intermediate' | 'advanced',
          durationMinutes,
          userId,
        }).catch((err) => {
          console.error(`[TTSService] Failed to generate lesson ${lesson.day_index + 1}:`, err);
        });
      }

      return { success: true, planId: plan.id };
    } catch (error) {
      console.error('[TTSService] generatePlan error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Generate a single lesson (calls Edge Function)
   */
  async generateLesson(request: LessonGenerationRequest): Promise<LessonGenerationResponse> {
    console.log('[TTSService] Generating lesson:', request.topic);

    try {
      const { data: session } = await supabase.auth.getSession();

      const response = await fetch(`${this.edgeFunctionUrl}/generate-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.session?.access_token}`,
        },
        body: JSON.stringify({
          planId: request.planId,
          lessonId: request.lessonId,
          topic: request.topic,
          lessonNumber: request.lessonNumber,
          totalLessons: request.totalLessons,
          userLevel: request.userLevel,
          durationMinutes: request.durationMinutes,
          sourceUrls: request.sourceUrls,
          userId: request.userId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error('[TTSService] Generation failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('[TTSService] Error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get the status of an AI generation job
   */
  async getJobStatus(jobId: string): Promise<{ status: string; progress: number }> {
    const { data, error } = await supabase
      .from('ai_jobs')
      .select('status, output')
      .eq('id', jobId)
      .single();

    if (error) {
      return { status: 'error', progress: 0 };
    }

    const progressMap: Record<string, number> = {
      pending: 0,
      processing: 50,
      completed: 100,
      failed: 0,
    };

    return {
      status: data.status,
      progress: progressMap[data.status] || 0,
    };
  }

  /**
   * Check if the TTS service is available
   */
  isAvailable(): boolean {
    return !!process.env.EXPO_PUBLIC_SUPABASE_URL;
  }
}

export const ttsService: TTSService = new TTSServiceImpl();
```

**✅ Checkpoint:** App service updated to connect to backend.

---

## Phase 7: Testing

**Estimated Time: 15 minutes**

### Step 7.1: Create Test Script

Create `scripts/test-backend.js`:

```javascript
// scripts/test-backend.js
// Run with: node scripts/test-backend.js

const CONTENT_SERVICE_URL = 'https://YOUR_USERNAME--daydif-content-generate-content.modal.run';
const TTS_SERVICE_URL = 'https://YOUR_USERNAME--daydif-tts-generate-tts.modal.run';

async function testBackend() {
  console.log('🧪 Testing DayDif Backend...\n');

  // Test 1: Content Generation
  console.log('1️⃣ Testing Content Generation...');
  try {
    const contentResponse = await fetch(CONTENT_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'The basics of time management',
        lesson_number: 1,
        total_lessons: 3,
        user_level: 'beginner',
        duration_minutes: 5,
      }),
    });
    const content = await contentResponse.json();
    console.log('   Status:', content.success ? '✅ SUCCESS' : '❌ FAILED');
    if (content.success) {
      console.log('   Title:', content.lesson.title);
      console.log('   Segments:', content.lesson.segments.length);
    } else {
      console.log('   Error:', content.error);
    }
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
  }

  console.log('');

  // Test 2: TTS Generation
  console.log('2️⃣ Testing TTS Generation...');
  try {
    const ttsResponse = await fetch(TTS_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello! This is a test of the DayDif text to speech system.',
        speaker: 'p225',
      }),
    });
    const tts = await ttsResponse.json();
    console.log('   Status:', tts.success ? '✅ SUCCESS' : '❌ FAILED');
    if (tts.success) {
      console.log('   Audio received:', tts.audio_base64 ? 'Yes (base64)' : tts.audio_url ? 'Yes (URL)' : 'No');
    } else {
      console.log('   Error:', tts.error);
    }
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
  }

  console.log('\n🎉 Backend tests complete!');
}

testBackend();
```

### Step 7.2: Run Tests

```bash
node scripts/test-backend.js
```

### Step 7.3: Test Full Flow in App

1. Start your app: `npm start`
2. Create a new plan with a topic
3. Watch the console for generation logs
4. Verify lessons appear with audio in the app

**✅ Checkpoint:** All services working end-to-end.

---

## Cost Summary

### Per Lesson Cost (20 minutes)

| Service | Calculation | Cost |
|---------|-------------|------|
| OpenAI GPT-4 | ~5,000 tokens | $0.13 |
| Modal TTS (T4 GPU) | ~1 min compute | $0.015 |
| Modal Content (CPU) | ~30 sec | $0.001 |
| **Total per lesson** | | **~$0.15** |

### Monthly Cost (10 lessons/week × 20 min)

| Item | Calculation | Cost |
|------|-------------|------|
| Lessons | 40 lessons | 40 × $0.15 = $6.00 |
| Supabase | Free tier | $0.00 |
| **Total monthly** | | **~$6.00/user** |

---

## Troubleshooting

### Common Issues

#### 1. Modal deployment fails
```bash
# Check Modal logs
modal app logs daydif-tts
modal app logs daydif-content
```

#### 2. Edge function returns 500
```bash
# Check Supabase logs
supabase functions logs generate-lesson
```

#### 3. TTS audio not playing
- Verify audio URLs are accessible
- Check Supabase Storage bucket permissions
- Ensure `expo-av` is properly configured

#### 4. Content generation timeout
- Increase timeout in Modal function
- Check OpenAI API status
- Reduce duration for testing

### Getting Help

- **Modal Discord:** https://discord.gg/modal
- **Supabase Discord:** https://discord.supabase.com
- **Open Notebook Discord:** https://www.open-notebook.ai/

---

## URLs Reference

Save these URLs after deployment:

```
# Supabase
Project Dashboard:    https://supabase.com/dashboard/project/YOUR_PROJECT_REF
Database URL:         https://YOUR_PROJECT_REF.supabase.co
Edge Function:        https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-lesson

# Modal
Dashboard:            https://modal.com/apps
Content Service:      https://YOUR_USERNAME--daydif-content-generate-content.modal.run
TTS Service:          https://YOUR_USERNAME--daydif-tts-generate-tts.modal.run
```

---

## Next Steps After Implementation

1. [ ] Add progress notifications (Supabase Realtime)
2. [ ] Implement voice selection UI
3. [ ] Add source URL input for lessons
4. [ ] Create lesson preview before generation
5. [ ] Add generation queue management
6. [ ] Implement retry logic for failed generations

---

**Document Version:** 1.0  
**Last Updated:** November 2024

